// ==========================================================================
  // 90 — Application wiring
// ==========================================================================

  const app = {
    ui: null,
    translator: null,
    titleOriginal: null,
    isTop: window.top === window.self,
    _runId: 0,

    async translate() {
      const tr = this.translator;
      if (!tr) return;
      const s = store.get();
      const ui = this.ui;

      service.cancel();
      const runId = (this._runId += 1);
      this._controller = new AbortController();

      let source = s.sourceLang;
      if (source === AUTO) {
        const sample = this.sampleText();
        const detected = await service.detect(sample, { signal: this._controller.signal });
        if (this._runId !== runId) return;
        if (detected) {
          service.lastDetected = detected;
          store.set({ lastDetected: detected });
        }
        if (s.skipSameLanguage && detected && normalizeLang(detected) === normalizeLang(s.targetLang)) {
          ui.open();
          ui.el.status.hidden = true;
          ui.el.hint.hidden = true;
          ui.el.err.textContent = t().sameLanguage;
          ui.el.err.hidden = false;
          return;
        }
      } else {
        service.lastDetected = normalizeLang(source);
      }
      source = source === AUTO ? AUTO : normalizeLang(source);
      service.lastSource = source;

      const offProgress = service.events.on('progress', ({ done, total }) =>
        ui.setProgress(done, Math.max(1, total)),
      );

      ui.open();
      ui.sync();
      ui.el.err.hidden = true;
      ui.setBusy(true);
      ui.el.statusText.textContent = t().translating;
      ui.setProgress(0, 1);

      try {
        await tr.translate({ source, target: s.targetLang, engineId: s.engineId, signal: this._controller.signal });
        if (this._runId !== runId) return;
        tr.startObserving();
        await this.translateTitle(source, s.targetLang, s.engineId, this._controller.signal);
      } catch (err) {
        if (!/abort/i.test(err.message || '')) {
          console.error('[MiriTranslator]', err);
          ui.showError(err);
        }
      } finally {
        offProgress();
        if (this._runId === runId) ui.setBusy(false);
        ui.sync();
      }
    },

    revert() {
      const s = store.get();
      this._runId += 1;
      service.cancel();
      if (this.translator) this.translator.revert();
      this.revertTitle();
      this.ui.sync();
      this.ui.toast(isKO ? '원문으로 돌아왔습니다.' : 'Back to the original page');
      void s;
    },

    translateOrRevert() {
      if (this.translator && this.translator.isTranslated) this.revert();
      else this.translate();
    },

    sampleText() {
      const body = document.body;
      if (!body) return '';
      const text = (body.innerText || body.textContent || '').replace(/\s+/g, ' ').trim();
      return text.slice(0, 600);
    },

    async translateTitle(source, target, engineId, signal) {
      if (!document.title) return;
      if (this.titleOriginal == null) this.titleOriginal = document.title;
      const original = this.titleOriginal;
      if (document.title === original && original.length < 2) return;
      try {
        const translated = await service.translateText(original, { source, target, engineId, signal });
        if (translated && translated !== document.title) document.title = translated;
      } catch {
        /* titles are best-effort */
      }
    },

    revertTitle() {
      if (this.titleOriginal != null) {
        document.title = this.titleOriginal;
        this.titleOriginal = null;
      }
    },

    broadcast(message) {
      if (!this.isTop) return;
      try {
        for (let i = 0; i < window.frames.length; i += 1) {
          try {
            window.frames[i].postMessage({ __miriTranslator: true, ...message }, '*');
          } catch {
            /* cross-origin frame */
          }
        }
      } catch {
        /* ignore */
      }
    },
  };

  // -------------------------------------------------------------- startup
  function boot() {
    app.translator = new PageTranslator();
    translatorRef.current = app.translator;
    app.ui = new MiriUI().mount();
    Object.assign(window.__MIRI_TRANSLATOR__, { app, store, service, ENGINES });

    // Sub-frames: no UI, just follow the top frame's commands.
    if (!app.isTop) {
      window.addEventListener('message', async (event) => {
        const data = event.data;
        if (!data || !data.__miriTranslator) return;
        const s = store.get();
        if (data.type === 'translate') {
          try {
            await app.translator.translate({
              source: data.source || AUTO,
              target: s.targetLang,
              engineId: s.engineId,
              mode: s.mode,
            });
            app.translator.startObserving();
          } catch (err) {
            console.warn('[MiriTranslator/frame]', err);
          }
        } else if (data.type === 'revert') {
          app.translator.revert();
          app.revertTitle();
        }
      });
      return;
    }

    // Reflect a detected language into the source selector once, quietly.
    (async () => {
      const s = store.get();
      if (isMobile() && !shouldAutoTranslate()) {
        // TWP greets you with its card when the page is not in your language.
        const detected = await service.detect(app.sampleText());
        if (detected && normalizeLang(detected) !== normalizeLang(s.targetLang)) {
          service.lastDetected = detected;
          store.set({ lastDetected: detected });
          app.ui.showCard();
          return;
        }
      }
      if (s.sourceLang === AUTO && app.sampleText().length > 80) {
        const detected = await service.detect(app.sampleText());
        if (detected && detected !== s.targetLang) store.set({ lastDetected: detected });
      }
    })();

    // Manager menu entries
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand(isKO ? '페이지 번역' : 'Translate page', () => app.translate());
      GM_registerMenuCommand(isKO ? '원문 보기' : 'Show original', () => app.revert());
      GM_registerMenuCommand(isKO ? '설정' : 'Settings', () => app.ui.showSettings());
      GM_registerMenuCommand(isKO ? '단축키 안내' : 'Shortcuts', () => app.ui.toast('Alt+T · Alt+R · Alt+S', 5000));
    }

    // Keyboard shortcuts live in MiriUI#onKey (Alt+T / Alt+R / Alt+S / Esc).

    // Auto-translate on load
    if (shouldAutoTranslate()) {
      setTimeout(() => app.translate(), 700);
    }

    // Let child frames follow along.
    const originalTranslate = app.translate.bind(app);
    app.translate = async () => {
      const result = originalTranslate();
      const s = store.get();
      app.broadcast({ type: 'translate', source: service.lastSource || s.sourceLang });
      return result;
    };
  }

  // Wait for <body> so the UI can attach cleanly.
  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }
})();