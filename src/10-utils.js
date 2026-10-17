// ==========================================================================
  // 10 — Utilities
  // ==========================================================================

  const now = () => Date.now();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  /** Escape a string for safe use inside HTML text/attributes. */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Tiny pub/sub. */
  function emitter() {
    const map = new Map();
    return {
      on(evt, fn) {
        if (!map.has(evt)) map.set(evt, new Set());
        map.get(evt).add(fn);
        return () => map.get(evt).delete(fn);
      },
      emit(evt, payload) {
        const set = map.get(evt);
        if (!set) return;
        for (const fn of Array.from(set)) {
          try {
            fn(payload);
          } catch (err) {
            console.warn('[MiriTranslator] listener failed', err);
          }
        }
      },
    };
  }

  /**
   * Retries `fn` with exponential backoff. Only retries when `shouldRetry(err)`
   * returns true (network errors, 429, 5xx…).
   */
  async function retry(fn, { attempts = 3, baseDelay = 600, shouldRetry = () => true } = {}) {
    let lastErr;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await fn(i);
      } catch (err) {
        lastErr = err;
        if (err && err.fatal) throw err;
        if (i === attempts - 1 || !shouldRetry(err)) break;
        await sleep(baseDelay * Math.pow(2, i) + Math.floor(Math.random() * 250));
      }
    }
    throw lastErr;
  }

  /** Is the current viewport coarse-pointer / small (i.e. a phone or tablet)? */
  function isMobile() {
    if (window.matchMedia) {
      return window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
    }
    return window.innerWidth <= 700;
  }

  /** Languages written right-to-left. */
  const RTL_LANGS = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ku']);
  const isRTL = (code) => RTL_LANGS.has(String(code || '').split('-')[0]);

  /** Rough "does this string contain natural-language words" heuristic. */
  function hasWords(text) {
    if (!text) return false;
    const t = text.replace(/\s+/g, '');
    if (t.length < 2) return false;
    // Must contain at least one letter from any script.
    return /[\p{L}]/u.test(t);
  }