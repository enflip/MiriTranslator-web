// ==========================================================================
  // 50 — Settings store
  // ==========================================================================

  const STORAGE_KEY = 'miriTranslator.settings';

  const DEFAULT_SETTINGS = {
    /** Language shown on the right-hand side of the language switcher. */
    targetLang: 'ko',
    /** 'auto' lets the engine detect it. */
    sourceLang: 'auto',
    /** Selected engine id, or 'auto' to let the scheduler choose. */
    engineId: 'auto',
    /** Fallback order used when engineId === 'auto'. */
    priority: ['google', 'papago', 'deepl-web', 'mymemory', 'reverso'],
    /** replace | bilingual | hide */
    mode: 'replace',
    /** Translate every matching page without asking. */
    alwaysOn: false,
    /** Sites that get auto-translated when alwaysOn is on. */
    autoSites: [],
    /** Sites never translated. */
    neverSites: [],
    /** Floating button visibility — off by default; the shortcut opens the popup. */
    showFab: false,
    /** auto | light | dark */
    theme: 'auto',
    /** Selection bubble. */
    selectionBubble: true,
    /** Skip text nodes shorter than this (characters). */
    minNodeLength: 1,
    /** Leave pre / code / kbd / samp alone — machine text translates badly. */
    skipCode: true,
    /** Extra CSS selectors to leave alone. */
    ignoreSelectors: '',
    /** Global request cap across all engines. */
    concurrency: 6,
    /** Show a toast when the page is already in the target language. */
    skipSameLanguage: true,
    /** Remember the last page's language detection in memory. */
    lastDetected: null,
  };

  const gmGet = typeof GM_getValue === 'function' ? GM_getValue : null;
  const gmSet = typeof GM_setValue === 'function' ? GM_setValue : null;

  function readRaw() {
    try {
      if (gmGet) return gmGet(STORAGE_KEY, null);
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }

  function writeRaw(value) {
    try {
      if (gmSet) gmSet(STORAGE_KEY, value);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (err) {
      console.warn('[MiriTranslator] settings write failed', err);
    }
  }

  /** Deep merge stored values over the defaults. */
  function mergeDefaults(stored) {
    const out = { ...DEFAULT_SETTINGS };
    if (!stored || typeof stored !== 'object') return out;
    for (const [key, value] of Object.entries(stored)) {
      if (key in DEFAULT_SETTINGS) out[key] = value;
    }
    // Drop engines that no longer ship, so an old config cannot break selection.
    if (Array.isArray(out.priority)) out.priority = out.priority.filter((id) => ENGINE_BY_ID.has(id));
    return out;
  }

  const storeEvents = emitter();

  let state = mergeDefaults(readRaw());

  const store = {
    get: () => state,
    /** Shallow patch. */
    set(patch) {
      const next = { ...state, ...patch };
      state = mergeDefaults(next);
      writeRaw(state);
      storeEvents.emit('change', state);
      return state;
    },
    reset() {
      state = mergeDefaults(null);
      writeRaw(state);
      storeEvents.emit('change', state);
    },
    on: storeEvents.on,
  };

  // ---------------------------------------------------------------- helpers
  const hostOf = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  function matchesList(host, list) {
    if (!Array.isArray(list) || !list.length) return false;
    return list.some((entry) => {
      const item = String(entry || '').trim().toLowerCase();
      if (!item) return false;
      const clean = item.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      return host === clean || host.endsWith(`.${clean}`) || item === host;
    });
  }

  /** Should this page be translated automatically on load? */
  function shouldAutoTranslate() {
    const s = store.get();
    if (!s.alwaysOn) return false;
    const host = hostOf(location.href);
    if (matchesList(host, s.neverSites)) return false;
    return true;
  }