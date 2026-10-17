// ==========================================================================
  // 40 — Translation engines
//
// Every engine exposes:
//   id, label, sub, keyless, color
//   maxChars        max characters per HTTP request
//   minInterval     polite delay between requests (ms)
//   concurrency     parallel requests this engine may open
//   mapLang(code)   canonical code -> engine code (null when unsupported)
//   supports(code)  does this engine handle the code as a target?
//   translate(texts, sl, tl, {signal, key, extra}) -> Promise<string[]>
// ==========================================================================

  const setOf = (arr) => new Set(arr);

  const ALL_CODES = () => setOf(LANGS.keys());

  const PAPAGO_CODES = setOf([
    'ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'th', 'id', 'fr', 'de', 'es', 'it', 'ru', 'pt',
    'tr', 'pl', 'ar', 'hi', 'bn', 'fa', 'nl', 'ms', 'sv', 'ro', 'hu', 'cs', 'da', 'fi', 'el',
    'he', 'uk', 'no', 'sk', 'sl', 'km', 'lo', 'my', 'ne', 'sq', 'sm', 'mi', 'af', 'cy', 'eu',
    'ka', 'hy', 'az', 'be', 'bs', 'mk', 'mn', 'so', 'sw', 'ur', 'ta', 'te', 'ml', 'kn', 'si',
    'am', 'zu', 'ht', 'haw', 'ceb', 'co', 'gd', 'st', 'ny',
  ]);

  const DEEPL_CODES = setOf([
    'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'hu', 'id', 'it', 'ja', 'ko',
    'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 'uk', 'zh-CN',
  ]);

  /** Split `texts` into request-sized groups honouring `maxChars`. */
  function packTexts(texts, maxChars) {
    const groups = [];
    let current = [];
    let size = 0;
    for (const text of texts) {
      const len = Array.from(text).length;
      if (current.length && size + len > maxChars) {
        groups.push(current);
        current = [];
        size = 0;
      }
      current.push(text);
      size += len + 1;
      if (current.length === 1 && size > maxChars) {
        groups.push(current);
        current = [];
        size = 0;
      }
    }
    if (current.length) groups.push(current);
    return groups;
  }

  /** Run jobs with a bounded pool, preserving output order. */
  async function runPool(jobs, concurrency, signal) {
    const results = new Array(jobs.length);
    let cursor = 0;
    const width = Math.max(1, Math.min(concurrency, jobs.length));
    const workers = Array.from({ length: width }, async () => {
      for (;;) {
        if (signal && signal.aborted) return;
        const index = cursor;
        cursor += 1;
        if (index >= jobs.length) return;
        results[index] = await jobs[index]();
      }
    });
    await Promise.all(workers);
    return results;
  }

  // --------------------------------------------------------------- Google
  // translate.googleapis.com endpoint that translate.google.com itself uses.
  const ENGINE_GOOGLE = {
    id: 'google',
    label: 'Google 번역',
    sub: '무료 · 키 불필요',
    keyless: true,
    color: '#4285f4',
    maxChars: 4500,
    minInterval: 40,
    concurrency: 6,
    badge: '기본',
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code : null),
    supports: (code) => LANGS.has(code),
    async translate(texts, sl, tl, { signal } = {}) {
      await respectRateLimit(this.id, this.minInterval);
      const out = new Array(texts.length);
      await runPool(
        texts.map((text, index) => async () => {
          const url =
            'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t' +
            `&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}` +
            `&q=${encodeURIComponent(text)}`;
          const res = await retry(
            () => http({ url, responseType: 'json', signal, timeout: 20000 }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!json || !Array.isArray(json[0])) throw new HttpError('Google 응답 형식 오류', { url });
          out[index] = json[0].map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('');
        }),
        this.concurrency,
        signal,
      );
      return out;
    },
    async detect(text, { signal } = {}) {
      const url =
        `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=en&q=${encodeURIComponent(
          text.slice(0, 400),
        )}`;
      const res = await http({ url, responseType: 'json', signal, timeout: 12000 });
      return res.json && res.json[2] ? normalizeLang(res.json[2]) : null;
    },
  };

  // -------------------------------------------------------------- Papago
  // papago.naver.com's own backend (N2MT engine) — no credentials required.
  const ENGINE_PAPAGO = {
    id: 'papago',
    label: '파파고',
    sub: '무료 · 키 불필요 · 한국어 최적',
    keyless: true,
    color: '#08cf5d',
    maxChars: 4500,
    minInterval: 80,
    concurrency: 5,
    badge: '한국어',
    mapLang: (code) => {
      if (code === AUTO) return AUTO;
      if (PAPAGO_CODES.has(code)) return code;
      const base = String(code).split('-')[0];
      return PAPAGO_CODES.has(base) ? base : null;
    },
    supports: (code) => ENGINE_PAPAGO.mapLang(code) !== null,
    async translate(texts, sl, tl, { signal } = {}) {
      const source = this.mapLang(sl) || AUTO;
      const target = this.mapLang(tl);
      if (!target) throw new Error(`파파고는 '${tl}'를 지원하지 않습니다`);
      await respectRateLimit(this.id, this.minInterval);
      const out = new Array(texts.length);
      await runPool(
        texts.map((text, index) => async () => {
          const body = new URLSearchParams({
            source,
            target,
            text,
            dict: 'false',
            useGlossary: 'false',
            honorific: 'false',
          }).toString();
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: 'https://papago.naver.com/api/text/translation',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                  Referer: 'https://papago.naver.com/',
                  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                },
                body,
                responseType: 'json',
                signal,
                timeout: 20000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!json || !json.translatedText) {
            throw new HttpError(`파파고 응답 오류 (${(json && json.errorCode) || 'unknown'})`, {
              status: res.status,
            });
          }
          out[index] = json.translatedText;
        }),
        this.concurrency,
        signal,
      );
      return out;
    },
  };

  // --------------------------------------------------------------- DeepL
  // The public translator widget backend at www2.deepl.com/jsonrpc.
  const ENGINE_DEEPL_WEB = {
    id: 'deepl-web',
    label: 'DeepL',
    sub: '무료 · 키 불필요 · 고품질',
    keyless: true,
    color: '#0f2b46',
    maxChars: 4000,
    minInterval: 300,
    concurrency: 2,
    badge: '고품질',
    mapLang: (code) => {
      if (code === AUTO) return AUTO;
      if (code === 'zh-CN' || code === 'zh-TW') return 'ZH';
      return DEEPL_CODES.has(code) ? code.toUpperCase() : null;
    },
    supports: (code) => ENGINE_DEEPL_WEB.mapLang(code) !== null,
    _id() {
      const n = Math.floor(Math.random() * 900000 + 100000);
      const t1 = Date.now();
      const t2 = t1 + (n - 500000);
      return n * 1000000 + (t1 - t2);
    },
    async translate(texts, sl, tl, { signal } = {}) {
      const source = this.mapLang(sl) || AUTO;
      const target = this.mapLang(tl);
      if (!target) throw new Error(`DeepL은 '${tl}'를 지원하지 않습니다`);
      const groups = packTexts(texts, this.maxChars);
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        groups.map((group) => async () => {
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: 'https://www2.deepl.com/jsonrpc',
                headers: {
                  'Content-Type': 'application/json',
                  Origin: 'https://www.deepl.com',
                  Referer: 'https://www.deepl.com/translator',
                  Accept: '*/*',
                },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'LMT_handle_texts',
                  params: {
                    splitting: 'newlines',
                    lang: {
                      source_lang_user_selected: source === AUTO ? 'auto' : source,
                      target_lang: target,
                    },
                    texts: {
                      texts: group,
                      translation_options: { origin: 'web', context: '' },
                    },
                  },
                  id: this._id(),
                }),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { attempts: 3, baseDelay: 1500, shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          const list = json && json.result && json.result.translations;
          if (!list) {
            const msg = (json && json.error && json.error.message) || 'DeepL 응답 오류';
            throw new HttpError(`DeepL: ${msg}`, { status: res.status });
          }
          return list.map((t) => t.text);
        }),
        this.concurrency,
        signal,
      );
      return results.flat();
    },
  };

  // ------------------------------------------------------- DeepL API Free
  const ENGINE_DEEPL_API = {
    id: 'deepl-api',
    label: 'DeepL API (Free)',
    sub: '공식 API · 월 50만자 무료',
    keyless: false,
    color: '#0f2b46',
    maxChars: 4800,
    minInterval: 150,
    concurrency: 3,
    keys: [
      { key: 'deeplKey', label: 'DeepL Auth Key', placeholder: 'xxxxxxxx-xxxx-…:fx', type: 'password' },
    ],
    mapLang: (code) => {
      if (code === AUTO) return AUTO;
      if (code === 'zh-CN' || code === 'zh-TW') return 'ZH';
      return DEEPL_CODES.has(code) ? code.toUpperCase() : null;
    },
    supports: (code) => ENGINE_DEEPL_API.mapLang(code) !== null,
    baseUrl(key) {
      return /:fx/.test(String(key || ''))
        ? 'https://api-free.deepl.com/v2/translate'
        : 'https://api.deepl.com/v2/translate';
    },
    async translate(texts, sl, tl, { signal, key } = {}) {
      const target = this.mapLang(tl);
      if (!target) throw new Error(`DeepL은 '${tl}'를 지원하지 않습니다`);
      const source = sl === AUTO ? '' : this.mapLang(sl) || '';
      const groups = packTexts(texts, this.maxChars);
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        groups.map((group) => async () => {
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: this.baseUrl(key),
                headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(
                  group.map((t) => (source ? { text: t, source_lang: source } : { text: t })),
                ),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!json || !json.translations) {
            const msg = (json && json.message) || 'DeepL API 응답 오류';
            throw new HttpError(msg, { status: res.status, fatal: res.status === 401 || res.status === 403 });
          }
          return json.translations.map((t) => t.text);
        }),
        this.concurrency,
        signal,
      );
      return results.flat();
    },
  };

  // ------------------------------------------------------------ Microsoft
  const ENGINE_MICROSOFT = {
    id: 'microsoft',
    label: 'Microsoft 번역',
    sub: '공식 API · 월 200만자 무료',
    keyless: false,
    color: '#0078d4',
    maxChars: 4000,
    minInterval: 120,
    concurrency: 3,
    keys: [
      { key: 'msKey', label: 'Subscription Key', placeholder: 'xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'msRegion', label: 'Region (비우면 global)', placeholder: 'global', type: 'text', optional: true },
    ],
    mapLang: (code) => {
      if (code === AUTO) return AUTO;
      if (code === 'zh-CN') return 'zh-Hans';
      if (code === 'zh-TW') return 'zh-Hant';
      return LANGS.has(code) ? code : null;
    },
    supports: (code) => ENGINE_MICROSOFT.mapLang(code) !== null,
    async translate(texts, sl, tl, { signal, key, extra } = {}) {
      const target = this.mapLang(tl);
      if (!target) throw new Error(`Microsoft는 '${tl}'를 지원하지 않습니다`);
      const source = sl === AUTO ? '' : this.mapLang(sl) || '';
      const region = (extra && extra.msRegion && extra.msRegion.trim()) || 'global';
      const qs =
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(target)}` +
        (source ? `&from=${encodeURIComponent(source)}` : '');
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: qs,
                headers: {
                  'Ocp-Apim-Subscription-Key': key,
                  'Ocp-Apim-Subscription-Region': region,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify([{ Text: text }]),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!Array.isArray(json) || !json[0] || !json[0].translations) {
            const msg = (json && (json.error ? JSON.stringify(json.error) : json.message)) || 'Microsoft 응답 오류';
            throw new HttpError(`Microsoft: ${msg}`, {
              status: res.status,
              fatal: res.status === 401 || res.status === 403,
            });
          }
          return json[0].translations.map((t) => t.text).join('');
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  // ---------------------------------------------------- Papago N2MT Cloud
  const ENGINE_PAPAGO_CLOUD = {
    id: 'papago-cloud',
    label: 'Papago N2MT (Naver Cloud)',
    sub: '공식 API · 월 100만자 무료',
    keyless: false,
    color: '#08cf5d',
    maxChars: 4500,
    minInterval: 120,
    concurrency: 3,
    keys: [
      { key: 'naverId', label: 'Client ID', placeholder: 'xxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'naverKey', label: 'Client Secret', placeholder: 'xxxxxxxxxxxxxxxx', type: 'password' },
    ],
    mapLang: (code) => (code === AUTO ? AUTO : PAPAGO_CODES.has(code) ? code : null),
    supports: (code) => ENGINE_PAPAGO_CLOUD.mapLang(code) !== null,
    async translate(texts, sl, tl, { signal, key, extra } = {}) {
      const target = this.mapLang(tl);
      if (!target) throw new Error(`Papago N2MT는 '${tl}'를 지원하지 않습니다`);
      const source = sl === AUTO ? AUTO : this.mapLang(sl) || AUTO;
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: 'https://openapi.naver.com/v1/nmt/nmt',
                headers: {
                  'X-Naver-Client-Id': key,
                  'X-Naver-Client-Secret': extra && extra.naverKey ? extra.naverKey : '',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ source, target, text }),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          const result = json && json.message && json.message.result;
          if (!result || typeof result.translatedText !== 'string') {
            const msg =
              (json && json.message && json.message.error && json.message.error.message) || 'Naver 응답 오류';
            throw new HttpError(msg, { status: res.status, fatal: res.status === 401 || res.status === 403 });
          }
          return result.translatedText;
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  // ----------------------------------------------------- MyMemory (free)
  const ENGINE_MYMEMORY = {
    id: 'mymemory',
    label: 'MyMemory',
    sub: '무료 · 키 불필요 · 백업용',
    keyless: true,
    color: '#2e7d32',
    maxChars: 490,
    minInterval: 200,
    concurrency: 2,
    keys: [{ key: 'mymemory', label: '이메일 (선택 · 사용량 증가)', placeholder: 'you@example.com', type: 'text', optional: true }],
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code.split('-')[0] : null),
    supports: (code) => LANGS.has(code),
    decode(text) {
      return String(text)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    },
    async translate(texts, sl, tl, { signal } = {}) {
      const source = this.mapLang(sl) || 'en';
      const target = this.mapLang(tl);
      if (!target) throw new Error(`MyMemory는 '${tl}'를 지원하지 않습니다`);
      const email = String((store.get().keys || {}).mymemory || '').trim();
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const url =
            'https://api.mymemory.translated.net/get?q=' +
            encodeURIComponent(text) +
            `&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}` +
            (email ? `&de=${encodeURIComponent(email)}` : '');
          const res = await retry(
            () => http({ url, responseType: 'json', signal, timeout: 20000 }),
            { shouldRetry: (e) => !!(e && (e.retriable || e.status === 403)) },
          );
          const json = res.json;
          if (!json || !json.responseData) throw new HttpError('MyMemory 응답 오류', { status: res.status });
          if (json.responseStatus && json.responseStatus !== 200) {
            const quota = /quota|QUERY LENGTH/i.test(json.responseDetails || '');
            throw new HttpError(
              quota ? 'MyMemory 사용량 또는 길이 제한 초과' : json.responseDetails || 'MyMemory 오류',
              { status: json.responseStatus, retriable: quota },
            );
          }
          return this.decode(json.responseData.translatedText);
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  // -------------------------------------------------------------- Reverso
  // Reverso's web API (Lingvanex engine). Cloudflare-gated, so stay gentle.
  const ENGINE_REVERSO = {
    id: 'reverso',
    label: 'Reverso',
    sub: '무료 · 키 불필요 · 백업용',
    keyless: true,
    color: '#1f6feb',
    maxChars: 700,
    minInterval: 1000,
    concurrency: 1,
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code.split('-')[0] : null),
    supports: (code) => LANGS.has(code),
    async translate(texts, sl, tl, { signal } = {}) {
      const source = this.mapLang(sl) || 'en';
      const target = this.mapLang(tl);
      if (!target) throw new Error(`Reverso는 '${tl}'를 지원하지 않습니다`);
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: 'https://api.reverso.net/translate/v1/translation',
                headers: {
                  'Content-Type': 'application/json',
                  Origin: 'https://www.reverso.net',
                  Referer: 'https://www.reverso.net/',
                },
                body: JSON.stringify({
                  format: 'text',
                  from: source,
                  to: target,
                  input: text,
                  options: {
                    origin: 'reversomobile',
                    sentenceSplitter: true,
                    contextResults: false,
                    languageDetection: false,
                  },
                }),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { attempts: 2, baseDelay: 2000, shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!json || !Array.isArray(json.translation)) {
            throw new HttpError('Reverso 응답 오류', { status: res.status });
          }
          return json.translation.join('\n');
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  // -------------------------------------------------- Google Cloud (v2)
  const ENGINE_GCLOUD = {
    id: 'gcloud',
    label: 'Google Cloud 번역',
    sub: '공식 API · 월 50만자 무료',
    keyless: false,
    color: '#4285f4',
    maxChars: 4500,
    minInterval: 120,
    concurrency: 3,
    keys: [{ key: 'gcloudKey', label: 'API Key', placeholder: 'AIza…', type: 'password' }],
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code : null),
    supports: (code) => LANGS.has(code),
    async translate(texts, sl, tl, { signal, key } = {}) {
      const groups = packTexts(texts, this.maxChars);
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        groups.map((group) => async () => {
          const payload = { q: group, target: tl, format: 'text' };
          if (sl !== AUTO) payload.source = sl;
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          const list = json && json.data && json.data.translations;
          if (!Array.isArray(list)) {
            const msg = (json && json.error && json.error.message) || 'Google Cloud 응답 오류';
            throw new HttpError(msg, { status: res.status, fatal: res.status === 400 || res.status === 403 });
          }
          return list.map((t) =>
            String(t.translatedText).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
          );
        }),
        this.concurrency,
        signal,
      );
      return results.flat();
    },
  };

  // ------------------------------------------------------- LibreTranslate
  const ENGINE_LIBRE = {
    id: 'libre',
    label: 'LibreTranslate',
    sub: '직접 호스팅 · 공개 인스턴스',
    keyless: false,
    needsUrl: true,
    color: '#6b4fbb',
    maxChars: 4000,
    minInterval: 200,
    concurrency: 2,
    keys: [
      { key: 'libreUrl', label: '인스턴스 주소', placeholder: 'https://libretranslate.com', type: 'text', default: 'https://libretranslate.com' },
      { key: 'libreKey', label: 'API Key (선택)', placeholder: '없으면 비워두세요', type: 'password', optional: true },
    ],
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code.split('-')[0] : null),
    supports: (code) => LANGS.has(code),
    async translate(texts, sl, tl, { signal, extra } = {}) {
      const base = String((extra && extra.libreUrl) || 'https://libretranslate.com').replace(/\/+$/, '');
      const apiKey = (extra && extra.libreKey) || '';
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const payload = { q: text, target: this.mapLang(tl), format: 'text' };
          if (sl !== AUTO) payload.source = this.mapLang(sl);
          if (apiKey) payload.api_key = apiKey;
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url: `${base}/translate`,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          const json = res.json;
          if (!json || typeof json.translatedText !== 'string') {
            throw new HttpError((json && json.error) || 'LibreTranslate 응답 오류', {
              status: res.status,
              fatal: res.status === 403,
            });
          }
          return json.translatedText;
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  // ------------------------------------------------------ Custom endpoint
  const ENGINE_CUSTOM = {
    id: 'custom',
    label: '사용자 정의 엔드포인트',
    sub: '임의의 JSON API',
    keyless: false,
    needsUrl: true,
    color: '#5f6368',
    maxChars: 4000,
    minInterval: 150,
    concurrency: 2,
    keys: [
      { key: 'customUrl', label: '요청 URL', placeholder: 'https://example.com/translate', type: 'text' },
      { key: 'customTextField', label: '본문 텍스트 필드명', placeholder: 'q', type: 'text', default: 'q' },
      { key: 'customRespField', label: '응답 필드 경로', placeholder: 'translatedText (a.b 중첩 가능)', type: 'text', default: 'translatedText' },
    ],
    mapLang: (code) => (code === AUTO ? AUTO : LANGS.has(code) ? code : null),
    supports: () => true,
    async translate(texts, sl, tl, { signal, extra } = {}) {
      const cfg = extra || {};
      const url = String(cfg.customUrl || '').trim();
      if (!url) throw new Error('요청 URL을 입력하세요');
      const textField = (cfg.customTextField || 'q').trim() || 'q';
      const respPath = (cfg.customRespField || 'translatedText').trim() || 'translatedText';
      const pick = (obj) => respPath.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
      await respectRateLimit(this.id, this.minInterval);
      const results = await runPool(
        texts.map((text) => async () => {
          const payload = {
            [textField]: text,
            source: sl,
            target: tl,
            from: sl,
            to: tl,
            lang: `${sl}-${tl}`,
          };
          const res = await retry(
            () =>
              http({
                method: 'POST',
                url,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                responseType: 'json',
                signal,
                timeout: 25000,
              }),
            { shouldRetry: (e) => !!(e && e.retriable) },
          );
          let value = pick(res.json);
          if (Array.isArray(value)) value = value.join('\n');
          if (typeof value !== 'string' || !value) {
            throw new HttpError('사용자 정의 엔드포인트 응답에서 텍스트를 찾지 못했습니다', {
              status: res.status,
            });
          }
          return value;
        }),
        this.concurrency,
        signal,
      );
      return results;
    },
  };

  const ENGINES = [
    ENGINE_GOOGLE,
    ENGINE_PAPAGO,
    ENGINE_DEEPL_WEB,
    ENGINE_DEEPL_API,
    ENGINE_MICROSOFT,
    ENGINE_PAPAGO_CLOUD,
    ENGINE_MYMEMORY,
    ENGINE_REVERSO,
    ENGINE_GCLOUD,
    ENGINE_LIBRE,
    ENGINE_CUSTOM,
  ];

  const ENGINE_BY_ID = new Map(ENGINES.map((e) => [e.id, e]));

  /** True when every mandatory key slot for this engine is filled in. */
  function engineUsable(engine) {
    if (engine.keyless) return true;
    const values = (engine.keys || [])
      .filter((k) => !k.optional && !(k.default && store.get().keys[k.key]))
      .map((k) => store.get().keys[k.key]);
    return values.every((v) => typeof v === 'string' && v.trim().length > 0);
  }