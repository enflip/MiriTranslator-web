// ==========================================================================
  // 70 — Translation service (scheduling, de-duplication, fallback)
// ==========================================================================

  /** Target size of one HTTP request, in characters. */
  const BATCH_CHARS = 1800;

  /**
   * Translate a group of texts with as few requests as possible.
   *
   * Blocks are joined with "\n" into a single request, which every engine we
   * ship handles natively (DeepL's `splitting: "newlines"` exists for exactly
   * this). The response is only accepted when it comes back with the same
   * number of lines — otherwise we retry the texts one by one so a stray
   * line break can never scramble the mapping.
   *
   * @returns {Promise<string[]>} one entry per input text
   */
  async function translateBatch(engine, texts, source, target, ctx) {
    const lineCounts = texts.map((t) => t.split('\n').length);
    const totalLines = lineCounts.reduce((a, b) => a + b, 0);
    const joined = texts.join('\n');

    if (texts.length > 1 && joined.length <= engine.maxChars) {
      try {
        const [blob] = await engine.translate([joined], source, target, ctx);
        const parts = String(blob).split('\n');
        if (parts.length === totalLines) {
          const out = [];
          let cursor = 0;
          for (const count of lineCounts) {
            out.push(parts.slice(cursor, cursor + count).join('\n'));
            cursor += count;
          }
          return out;
        }
        console.warn(
          `[MiriTranslator] ${engine.id} 배치 정렬 불일치 (${parts.length}/${totalLines}) — 개별 요청으로 재시도`,
        );
      } catch (err) {
        if (err && (err.fatal || err.name === 'HttpError')) throw err;
      }
    }
    return engine.translate(texts, source, target, ctx);
  }

  const service = {
    events: emitter(),
    cache: new Map(),
    lastSource: AUTO,
    lastDetected: null,
    lastEngine: null,
    busy: false,
    _controller: null,

    clearCache() {
      this.cache.clear();
    },

    cancel() {
      if (this._controller) {
        try {
          this._controller.abort();
        } catch {
          /* noop */
        }
        this._controller = null;
      }
    },

    isBusy() {
      return this.busy;
    },

    /** Engines able to serve `target`, most-preferred first. */
    selectEngines(target, engineId) {
      const s = store.get();
      const ids = engineId && engineId !== 'auto' ? [engineId, ...s.priority] : s.priority;
      const seen = new Set();
      const out = [];
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        const engine = ENGINE_BY_ID.get(id);
        if (!engine || !engineUsable(engine)) continue;
        let ok = false;
        try {
          ok = engine.supports(target);
        } catch {
          ok = false;
        }
        if (!ok) continue;
        out.push(engine);
      }
      return out;
    },

    /** Human-readable list of engines that can serve a pair. */
    availableEngines(target) {
      return ENGINES.filter((e) => engineUsable(e) && (() => {
        try {
          return e.supports(target);
        } catch {
          return false;
        }
      })());
    },

    cacheKey(sl, tl, text) {
      return `${sl}>${tl}>${text}`;
    },

    /**
     * Translate a batch of units, applying each result as soon as it lands.
     * @param {Array} units  from PageTranslator#collect
     */
    async translateUnits(units, { source, target, engineId, signal, mode, onUnit }) {
      this.cancel();
      const controller = new AbortController();
      this._controller = controller;
      const localSignal = signal || controller.signal;
      this.busy = true;
      this.lastSource = source || AUTO;
      this.events.emit('start', { total: units.length });

      const engines = this.selectEngines(target, engineId);
    if (!engines.length) {
      this.busy = false;
      const msg = `'${target}'를 번역할 수 있는 엔진이 없습니다.`;
      this.events.emit('error', new Error(msg));
      throw new Error(msg);
    }

      const page = translatorRef.current;
      const applied = new Set();

      try {
        // 1. De-duplicate identical strings across the whole page.
        const unique = new Map(); // text -> units[]
        for (const unit of units) {
          if (!unique.has(unit.text)) unique.set(unit.text, []);
          unique.get(unit.text).push(unit);
        }

        // 2. Slice into progressive batches so the page paints early.
        const batches = [];
        let current = [];
        let chars = 0;
        for (const [text, owners] of unique) {
          if (current.length && (chars + text.length > BATCH_CHARS || current.length >= 24)) {
            batches.push(current);
            current = [];
            chars = 0;
          }
          current.push({ text, owners });
          chars += text.length;
        }
        if (current.length) batches.push(current);

        // 3. Translate batch by batch, falling through the engine list on failure.
        for (const batch of batches) {
          if (localSignal.aborted) break;
          const pending = batch.filter((item) => !this.cache.has(this.cacheKey(source, target, item.text)));
          if (pending.length) {
            let translated = null;
            let lastErr = null;
            for (const engine of engines) {
              try {
                const out = await translateBatch(engine, pending.map((i) => i.text), source, target, {
                  signal: localSignal,
                });
                if (!out || out.length !== pending.length) throw new Error('응답 개수 불일치');
                translated = out;
                this.lastEngine = engine;
                this.events.emit('engine', engine);
                break;
              } catch (err) {
                lastErr = err;
                if (localSignal.aborted) throw err;
                console.warn(`[MiriTranslator] ${engine.id} 실패:`, err && err.message);
              }
            }
            if (!translated) throw lastErr || new Error('번역에 실패했습니다');
            pending.forEach((item, i) => {
              this.cache.set(this.cacheKey(source, target, item.text), translated[i]);
            });
          }

          // 4. Apply everything in this batch.
          for (const item of batch) {
            const value = this.cache.get(this.cacheKey(source, target, item.text));
            if (value == null) continue;
            for (const owner of item.owners) {
              if (applied.has(owner)) continue;
              applied.add(owner);
              if (page) page.applyUnit(owner, value, mode);
            }
            if (onUnit) onUnit({ done: applied.size, total: units.length });
          }
          this.events.emit('progress', { done: applied.size, total: units.length });
        }
      } catch (err) {
        this.events.emit('error', err);
        throw err;
      } finally {
        this.busy = false;
        if (this._controller === controller) this._controller = null;
        this.events.emit('finish', { ok: applied.size > 0 });
      }
      return applied.size;
    },

    /** One-off string translation (selection bubble, title, etc.). */
    async translateText(text, { source = AUTO, target = store.get().targetLang, engineId, signal } = {}) {
      const key = this.cacheKey(source, target, text);
      if (this.cache.has(key)) return this.cache.get(key);
      const engines = this.selectEngines(target, engineId);
      if (!engines.length) throw new Error('사용 가능한 번역 엔진이 없습니다');
      let lastErr;
      for (const engine of engines) {
        try {
          const out = await engine.translate([text], source, target, { signal });
          this.cache.set(key, out[0]);
          this.events.emit('engine', engine);
          this.lastEngine = engine;
          return out[0];
        } catch (err) {
          lastErr = err;
          if (err && err.fatal) break;
        }
      }
      throw lastErr || new Error('번역에 실패했습니다');
    },

    /** Detect the language of a sample using Google (the cheapest detector). */
    async detect(text, { signal } = {}) {
      const probe = (text || '').replace(/\s+/g, ' ').trim().slice(0, 400);
      if (probe.length < 8) return null;
      if (ENGINE_GOOGLE.detect) {
        try {
          return await ENGINE_GOOGLE.detect(probe, { signal });
        } catch {
          /* fall through */
        }
      }
      return null;
    },
  };