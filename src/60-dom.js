/** Instance reference so the service layer can reach the active translator. */
  const translatorRef = { current: null };

  // ==========================================================================
  // 60 — DOM translation engine
  //
  // Text nodes are grouped by their nearest *block-level* ancestor so that a
  // paragraph (or a sentence spread across inline tags) becomes one translation
  // unit. Units are joined with "\n" — every engine we ship preserves line
  // breaks, which lets us map the response back onto the individual nodes.
  // ==========================================================================

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'CANVAS', 'IFRAME',
    'OBJECT', 'EMBED', 'AUDIO', 'VIDEO', 'TRACK', 'SOURCE', 'PARAM', 'MAP', 'AREA',
    'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'OPTGROUP', 'BUTTON', 'LABEL',
  ]);

  const BASE_SKIP_SELECTOR = [
    '[data-mt]', '[translate="no"]', '.notranslate',
    '[contenteditable=""]', '[contenteditable="true"]', '[contenteditable="plaintext-only"]',
    '.highlight', '.katex', '.MathJax', 'mjx-container', '.echarts', '.monaco-editor',
    '.CodeMirror', 'cm-editor', '.visually-hidden', '.sr-only',
  ];

  const CODE_SELECTOR = ['pre', 'code', 'kbd', 'samp', 'var', 'tt'];

  const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CAPTION', 'DD', 'DETAILS', 'DIALOG',
    'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
    'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI', 'MAIN', 'NAV',
    'OL', 'P', 'SECTION', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
  ]);

  /** Nearest block-level ancestor, or null when we reach <body>/<html>. */
  function blockAnchor(node) {
    let el = node.nodeType === 1 ? node : node.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      if (BLOCK_TAGS.has(el.tagName)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /** Split a translated blob back onto the original lines. */
  function splitAligned(lines, translated) {
    if (typeof translated !== 'string') return lines.slice();
    const parts = translated.split('\n');
    if (parts.length === lines.length) return parts;
    if (parts.length > lines.length) {
      const out = lines.map((_, i) => parts[i]);
      for (let i = lines.length; i < parts.length; i += 1) {
        out[out.length - 1] += (out[out.length - 1] ? ' ' : '') + parts[i];
      }
      return out;
    }
    const out = parts.slice();
    while (out.length < lines.length) out.push('');
    return out;
  }

  const leadingWs = (s) => (s.match(/^\s*/) || [''])[0];
  const trailingWs = (s) => (s.match(/\s*$/) || [''])[0];

  class PageTranslator {
    constructor() {
      /** @type {Map<Text, {original:string, applied:string|null, originalSpan?:Element}>} */
      this.nodes = new Map();
      /** Elements we inserted, removed again on revert. */
      this.inserted = new Set();
      this.active = false;
      this.observer = null;
      this._applying = false;
      this._timer = null;
    }

    get isTranslated() {
      return this.nodes.size > 0;
    }

    buildSelector() {
      const s = store.get();
      const parts = BASE_SKIP_SELECTOR.slice();
      if (s.skipCode) parts.push(...CODE_SELECTOR);
      const extra = (s.ignoreSelectors || '').trim();
      if (extra) parts.push(extra);
      return parts.join(', ');
    }

    /**
     * Collect translation units under `root`.
     * @returns {Array<{anchor:Element, items:Array, text:string}>}
     */
    collect(root = document.body) {
      const skipSelector = this.buildSelector();
      const minLen = Math.max(0, store.get().minNodeLength | 0);
      const groups = new Map();

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (skipSelector) {
            try {
              if (parent.closest(skipSelector)) return NodeFilter.FILTER_REJECT;
            } catch {
              /* invalid user selector — ignore it */
            }
          }
          if (parent.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
          if (!hasWords(node.nodeValue)) return NodeFilter.FILTER_REJECT;
          if (node.nodeValue.trim().length < minLen) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      const groupsMap = groups;
      let current;
      while ((current = walker.nextNode())) {
        if (this.nodes.has(current)) continue; // already processed
        if (!current.isConnected) continue;
        const anchor = blockAnchor(current);
        if (!anchor) continue;
        const raw = current.nodeValue;
        const core = raw.trim();
        if (!core) continue;
        if (!groupsMap.has(anchor)) groupsMap.set(anchor, { anchor, items: [] });
        groupsMap.get(anchor).items.push({
          node: current,
          text: core,
          lead: leadingWs(raw),
          tail: trailingWs(raw),
        });
      }

      // Split oversized groups so no single request exceeds ~2500 characters.
      const units = [];
      for (const group of groupsMap.values()) {
        let chunkItems = [];
        let chunkLen = 0;
        const flush = () => {
          if (!chunkItems.length) return;
          units.push({
            anchor: group.anchor,
            items: chunkItems,
            text: chunkItems.map((it) => it.text).join('\n'),
          });
          chunkItems = [];
          chunkLen = 0;
        };
        for (const item of group.items) {
          if (chunkItems.length && chunkLen + item.text.length > 2500) flush();
          chunkItems.push(item);
          chunkLen += item.text.length + 1;
        }
        flush();
      }
      return units;
    }

    /**
     * Translate every unit under the page.
     * @param {{source:string, target:string, engineId?:string, mode?:string, signal?:AbortSignal}} opts
     * @param {(info:{done:number,total:number})=>void} onProgress
     */
    async translate(opts, onProgress) {
      if (this.active) return;
      const units = this.collect(opts.root || document.body);
      if (!units.length) {
        if (onProgress) onProgress({ done: 0, total: 0 });
        return;
      }
      this.active = true;
      const controller = new AbortController();
      const signal = opts.signal || controller.signal;

      // Register originals up-front so the observer (and a re-run) skip them.
      // The *raw* node value is kept so a revert restores the byte-exact page.
      for (const unit of units) {
        for (const item of unit.items) {
          if (!this.nodes.has(item.node)) {
            this.nodes.set(item.node, {
              original: item.node.nodeValue,
              applied: null,
              originalSpan: null,
            });
          }
        }
      }

      const mode = opts.mode || store.get().mode;
      try {
        await service.translateUnits(units, { ...opts, signal, mode });
      } finally {
        this.active = false;
        this._applying = false;
      }
    }

    /** Restore every node we touched and remove everything we inserted. */
    revert() {
      this.stopObserving();
      for (const [node, rec] of Array.from(this.nodes)) {
        if (rec.originalSpan && rec.originalSpan.parentNode) {
          rec.originalSpan.replaceWith(document.createTextNode(rec.original));
        } else if (node.parentNode) {
          node.nodeValue = rec.original;
        }
      }
      for (const el of Array.from(this.inserted)) {
        if (el.parentNode) el.remove();
      }
      this.inserted.clear();
      this.nodes.clear();
      service.clearCache();
    }

    // -------------------------------------------------------------- apply
    applyUnit(unit, translatedText, mode) {
      const lines = splitAligned(unit.items.map((i) => i.text), translatedText);
      this._applying = true;
      try {
        if (mode === 'bilingual') {
          this._insertBilingual(unit, lines);
        } else {
          unit.items.forEach((item, i) => {
            const value = lines[i] != null ? lines[i] : '';
            this._writeNode(item, value, mode === 'hide');
          });
        }
      } catch (err) {
        console.warn('[MiriTranslator] apply failed', err);
      } finally {
        this._applying = false;
      }
    }

    _writeNode(item, translated, hideOriginal) {
      const node = item.node;
      const rec = this.nodes.get(node);
      if (!rec) return;
      if (hideOriginal && !rec.originalSpan) {
        const span = document.createElement('span');
        span.className = 'mt-orig-hidden';
        span.setAttribute('data-mt', '1');
        node.parentNode.insertBefore(span, node);
        span.appendChild(node);
        rec.originalSpan = span;
      }
      node.nodeValue = `${item.lead}${translated}${item.tail}`;
      rec.applied = translated;
    }

    _insertBilingual(unit, lines) {
      const first = unit.items[0] && unit.items[0].node;
      const host = first ? first.parentElement : null;
      const existing = host && host.querySelector(':scope > .mt-bi[data-unit]');
      if (existing) {
        existing.innerHTML = lines.map((l) => `<span>${esc(l)}</span>`).join('<br>');
        return;
      }
      const box = document.createElement('div');
      box.className = 'mt-bi';
      box.setAttribute('data-mt', '1');
      box.setAttribute('data-unit', '1');
      box.setAttribute('translate', 'no');
      if (isRTL(store.get().targetLang)) box.setAttribute('dir', 'rtl');
      box.innerHTML = lines.map((l) => `<span>${esc(l)}</span>`).join('<br>');
      unit.anchor.parentNode.insertBefore(box, unit.anchor.nextSibling);
      this.inserted.add(box);
    }

    // ---------------------------------------------------------- observing
    startObserving() {
      if (this.observer || !document.body) return;
      this.observer = new MutationObserver((records) => {
        if (this._applying || !this.nodes.size) return;
        for (const rec of records) {
          const el = rec.target.nodeType === 1 ? rec.target : rec.target.parentElement;
          if (el && el.closest && el.closest('[data-mt]')) continue;
          if (SKIP_TAGS.has(rec.target.nodeName)) continue;
          this._schedule();
          return;
        }
      });
      this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    stopObserving() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }

    _schedule() {
      if (this._timer) return;
      this._timer = setTimeout(async () => {
        this._timer = null;
        if (this.active || !this.nodes.size) return;
        const units = this.collect(document.body);
        if (!units.length) return;
        const s = store.get();
        for (const unit of units) {
          for (const item of unit.items) {
            if (!this.nodes.has(item.node)) {
              this.nodes.set(item.node, {
                original: item.node.nodeValue,
                applied: null,
                originalSpan: null,
              });
            }
          }
        }
        try {
          await service.translateUnits(units, {
            source: service.lastSource || AUTO,
            target: s.targetLang,
            engineId: s.engineId,
            mode: s.mode,
          });
        } catch (err) {
          console.warn('[MiriTranslator] dynamic translation stopped', err);
        }
      }, 1000);
    }
  }