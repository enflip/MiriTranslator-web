/** Instance reference so the service layer can reach the active translator. */
  const translatorRef = { current: null };

  // ==========================================================================
  // 60 — DOM translation engine
  //
  // Two shapes of source have to be handled:
  //
  //  1. Ordinary pages. Text nodes are grouped by their nearest block-level
  //     ancestor, so a paragraph (or a sentence spread across inline tags)
  //     becomes one translation unit. Units are joined with "\n" — every engine
  //     preserves line breaks, which lets us map the response back onto the
  //     individual nodes.
  //
  //  2. Character-split editors (Cosense/scrapbox, some search UIs, a11y
  //     widgets) wrap *every single character* in its own <span>. Those one-char
  //     nodes are useless on their own, so a parent that is made mostly of tiny
  //     nodes is collapsed into one unit and replaced wholesale.
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

  /** Elements a per-character container is allowed to hold. */
  const INLINE_TAGS = new Set(['SPAN', 'B', 'I', 'EM', 'STRONG', 'U', 'S', 'SUB', 'SUP', 'BR', 'A', 'SMALL']);

  // Cosense/scrapbox emits one <span class="char-index"> per character, so a
  // real line is 60+ nodes of exactly one character each. We collapse such a
  // container into a single translatable unit instead of trying to translate
  // one-character fragments (which never survive the round trip).
  const FRAGMENT_MIN_NODES = 4;
  const FRAGMENT_MAX_NODE = 2;

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

  /**
   * Is this element a per-character container? True only when every piece of
   * text inside it is a tiny node and nothing but inline elements is inside, so
   * ordinary markup like `<p>See <a>docs</a></p>` is never mistaken for one.
   */
  function isFragmentContainer(el) {
    if (!el || SKIP_TAGS.has(el.tagName)) return false;
    if (el.hasAttribute && el.hasAttribute('data-mt')) return false;
    let nodes = 0;
    for (const child of el.childNodes) {
      if (child.nodeType === 3) {
        const v = child.nodeValue.trim();
        if (!v) continue;
        if (v.length > FRAGMENT_MAX_NODE) return false;
        nodes += 1;
      } else if (child.nodeType === 1) {
        if (!INLINE_TAGS.has(child.tagName)) return false;
        const text = (child.textContent || '').trim();
        if (text.length > FRAGMENT_MAX_NODE) return false;
        if (text) nodes += 1;
      }
    }
    return nodes >= FRAGMENT_MIN_NODES;
  }

  class PageTranslator {
    constructor() {
      /** @type {Map<Text, {original:string, applied:string|null, originalSpan?:Element}>} */
      this.nodes = new Map();
      /** Collapsed containers: element -> {html, applied}. */
      this.fragments = new Map();
      /** Elements we inserted, removed again on revert. */
      this.inserted = new Set();
      /**
       * Whether the page is currently translated. Deliberately NOT derived from
       * the maps: pruning drops every entry of a page that re-rendered itself,
       * and the observer must keep following it even with nothing tracked yet.
       */
      this.enabled = false;
      this.active = false;
      this.observer = null;
      this._applying = false;
      this._timer = null;
    }

    get isTranslated() {
      return this.enabled;
    }

    buildSelector() {
      const s = store.get();
      const parts = BASE_SKIP_SELECTOR.slice();
      if (s.skipCode) parts.push(...CODE_SELECTOR);
      const extra = (s.ignoreSelectors || '').trim();
      if (extra) parts.push(extra);
      return parts.join(', ');
    }

    /** Drop references to nodes the page has already discarded (SPAs). */
    prune() {
      let dropped = 0;
      for (const [node] of this.nodes) {
        if (!node.isConnected) {
          this.nodes.delete(node);
          dropped += 1;
        }
      }
      for (const [el] of this.fragments) {
        if (!el.isConnected) {
          this.fragments.delete(el);
          dropped += 1;
        }
      }
      return dropped;
    }

    /**
     * Collect translation units under `root`.
     * @returns {Array<{kind:string, anchor:Element, items:Array, text:string}>}
     */
    collect(root = document.body) {
      const skipSelector = this.buildSelector();
      const minLen = Math.max(0, store.get().minNodeLength | 0);
      /** @type {Map<Element, {anchor:Element, items:Array}>} */
      const groups = new Map();

      // --- Pass 1: locate per-character containers (Cosense/scrapbox & co). ---
      const fragmentRoots = new Set();
      const elementWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (candidate) =>
          fragmentRoots.has(candidate.parentElement || candidate)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      });
      let el;
      while ((el = elementWalker.nextNode())) {
        if (!el.textContent || !el.textContent.trim()) continue;
        if (!isFragmentContainer(el)) continue;
        fragmentRoots.add(el);
      }

      // --- Pass 2: walk text nodes, skipping anything inside a fragment root. ---
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

      let node;
      while ((node = walker.nextNode())) {
        if (this.nodes.has(node) || !node.isConnected) continue;
        const parent = node.parentElement;
        const raw = node.nodeValue;
        const core = raw.trim();
        if (!core) continue;

        let insideFragment = false;
        for (let up = parent; up && up !== root; up = up.parentElement) {
          if (fragmentRoots.has(up)) {
            insideFragment = true;
            break;
          }
        }
        if (insideFragment) continue;

        const anchor = blockAnchor(node);
        if (!anchor) continue;
        if (!groups.has(anchor)) groups.set(anchor, { anchor, items: [] });
        groups.get(anchor).items.push({
          node,
          text: core,
          lead: leadingWs(raw),
          tail: trailingWs(raw),
        });
      }

      const units = [];

      // --- Pass 3: one unit per fragment container, whole line in, whole line out. ---
      for (const fragEl of fragmentRoots) {
        if (!fragEl.isConnected || this.fragments.has(fragEl)) continue;
        const text = (fragEl.textContent || '').replace(/\s+/g, ' ').trim();
        if (!hasWords(text)) continue;
        this.fragments.set(fragEl, { html: fragEl.innerHTML, applied: null });
        units.push({ kind: 'frag', anchor: fragEl, el: fragEl, text });
      }

      // --- Pass 4: split oversized groups so no request exceeds ~2500 characters. ---
      for (const group of groups.values()) {
        let chunkItems = [];
        let chunkLen = 0;
        const flush = () => {
          if (!chunkItems.length) return;
          units.push({
            kind: 'text',
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
     */
    async translate(opts) {
      if (this.active) return;
      this.prune();
      const units = this.collect(opts.root || document.body);
      if (!units.length) return;
      this.active = true;
      const controller = new AbortController();
      const signal = opts.signal || controller.signal;

      // Register originals up-front so the observer (and a re-run) skip them.
      for (const unit of units) {
        if (unit.kind === 'frag') continue;
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
        this.enabled = true;
      } finally {
        this.active = false;
        this._applying = false;
      }
    }

    /** Restore every node we touched and remove everything we inserted. */
    revert() {
      this.stopObserving();
      this.enabled = false;
      for (const [node, rec] of Array.from(this.nodes)) {
        if (rec.originalSpan && rec.originalSpan.parentNode) {
          rec.originalSpan.replaceWith(document.createTextNode(rec.original));
        } else if (node.parentNode) {
          node.nodeValue = rec.original;
        }
      }
      for (const [el, rec] of Array.from(this.fragments)) {
        if (el.isConnected && rec.html != null) el.innerHTML = rec.html;
      }
      for (const el of Array.from(this.inserted)) {
        if (el.parentNode) el.remove();
      }
      this.inserted.clear();
      this.nodes.clear();
      this.fragments.clear();
      service.clearCache();
    }

    // -------------------------------------------------------------- apply
    applyUnit(unit, translatedText, mode) {
      this._applying = true;
      try {
        if (unit.kind === 'frag') this._applyFragment(unit.el, translatedText);
        else this._applyText(unit, translatedText, mode);
      } catch (err) {
        console.warn('[MiriTranslator] apply failed', err);
      } finally {
        this._applying = false;
      }
    }

    _applyText(unit, translatedText, mode) {
      const lines = splitAligned(unit.items.map((i) => i.text), translatedText);
      if (mode === 'bilingual') {
        this._insertBilingual(unit, lines);
        return;
      }
      unit.items.forEach((item, i) => {
        this._writeNode(item, lines[i] != null ? lines[i] : '', mode === 'hide');
      });
    }

    /** Replace a per-character container with one plain text node. */
    _applyFragment(el, translatedText) {
      const rec = this.fragments.get(el) || { html: el.innerHTML, applied: null };
      if (rec.html == null) rec.html = el.innerHTML;
      this.fragments.set(el, rec);
      el.textContent = typeof translatedText === 'string' ? translatedText : String(translatedText || '');
      rec.applied = el.textContent;
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
        if (this._applying || !this.isTranslated) return;
        // Drop references the page has already discarded before scheduling —
        // SPAs rebuild their DOM constantly, so this is what keeps the map bounded.
        this.prune();
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
        if (this.active || !this.isTranslated) return;
        this.prune();
        const units = this.collect(document.body);
        if (!units.length) return;
        const s = store.get();
        for (const unit of units) {
          if (unit.kind === 'frag') continue;
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
