// ==========================================================================
  // 30 — Network layer
  // Prefers GM_xmlhttpRequest (immune to page CORS + CSP) and transparently
  // falls back to fetch() inside the page context.
// ==========================================================================

  class HttpError extends Error {
    constructor(message, { status = 0, url = '', retriable = false, fatal = false, body = '' } = {}) {
      super(message);
      this.name = 'HttpError';
      this.status = status;
      this.url = url;
      this.retriable = retriable;
      this.fatal = fatal;
      this.body = body;
    }
  }

  const HAS_GM_XHR = typeof GM_xmlhttpRequest === 'function';

  const CHROME_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

  /**
   * Perform an HTTP request.
   * @param {{method?:string, url:string, headers?:object, body?:any,
   *          timeout?:number, responseType?:'text'|'json', signal?:AbortSignal}} opts
   * @returns {Promise<{status:number, text:string, json:any, headers:object}>}
   */
  function http(opts) {
    const {
      method = 'GET',
      url,
      headers = {},
      body,
      timeout = 20000,
      responseType = 'text',
      signal,
    } = opts;

    if (signal && signal.aborted) return Promise.reject(new HttpError('Aborted', { url }));

    if (HAS_GM_XHR) {
      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (fn, arg) => {
          if (settled) return;
          settled = true;
          signal && signal.removeEventListener('abort', onAbort);
          fn(arg);
        };

        const handle = {
          method,
          url,
          headers: {
            'User-Agent': CHROME_UA,
            Accept: '*/*',
            ...headers,
          },
          timeout,
          anonymous: false,
          onload: (res) => {
            const status = res.status || 0;
            const text = res.responseText || '';
            if (status >= 200 && status < 300) {
              let json = null;
              if (responseType === 'json') {
                try {
                  json = JSON.parse(text);
                } catch {
                  json = null;
                }
              }
              finish(resolve, { status, text, json, headers: res.responseHeaders || {} });
            } else {
              finish(
                reject,
                new HttpError(`HTTP ${status}`, {
                  status,
                  url,
                  retriable: status === 429 || status === 408 || status >= 500,
                  body: text,
                }),
              );
            }
          },
          onerror: () =>
            finish(reject, new HttpError('Network error', { url, retriable: true })),
          ontimeout: () => finish(reject, new HttpError('Timeout', { url, retriable: true })),
          onabort: () => finish(reject, new HttpError('Aborted', { url })),
        };

        const onAbort = () => {
          try {
            handle.abort();
          } catch {
            /* noop */
          }
          finish(reject, new HttpError('Aborted', { url }));
        };
        if (signal) signal.addEventListener('abort', onAbort, { once: true });

        if (body != null) {
          handle.data = typeof body === 'string' ? body : JSON.stringify(body);
        }
        try {
          GM_xmlhttpRequest(handle);
        } catch (err) {
          finish(reject, new HttpError(err && err.message ? err.message : 'GM request failed', { url }));
        }
      });
    }

    // ---- fetch() fallback -------------------------------------------------
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const onAbort = () => controller.abort();
    if (signal) signal.addEventListener('abort', onAbort, { once: true });

    return fetch(url, {
      method,
      headers: {
        'User-Agent': CHROME_UA,
        ...headers,
      },
      body: body == null ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new HttpError(`HTTP ${res.status}`, {
            status: res.status,
            url,
            retriable: res.status === 429 || res.status === 408 || res.status >= 500,
            body: text,
          });
        }
        let json = null;
        if (responseType === 'json') {
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
        }
        return { status: res.status, text, json, headers: {} };
      })
      .catch((err) => {
        if (err instanceof HttpError) throw err;
        // A bare TypeError here is almost always CORS or an offline network —
        // mark it retriable so the scheduler can move on to another engine.
        throw new HttpError('Network/CORS error', { url, retriable: true });
      })
      .finally(() => {
        clearTimeout(timer);
        if (signal) signal.removeEventListener('abort', onAbort);
      });
  }

  /** Per-engine minimum interval between requests (gentle rate limiting). */
  const rateLimiter = new Map();

  async function respectRateLimit(engineId, minInterval) {
    if (!minInterval) return;
    const gate = rateLimiter.get(engineId) || Promise.resolve();
    let release;
    const next = new Promise((resolve) => {
      release = resolve;
    });
    rateLimiter.set(engineId, gate.then(() => next));
    await gate;
    setTimeout(release, minInterval);
  }

  /** Human-friendly error text for the UI. */
  function describeError(err) {
    if (!err) return '알 수 없는 오류';
    if (err.status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도합니다.';
    if (err.status === 401 || err.status === 403) return '접근이 거부되었습니다. API 키를 확인하세요.';
    if (err.status === 400) return '요청이 거부되었습니다. API 키 또는 언어를 확인하세요.';
    if (err.name === 'HttpError' && /timeout/i.test(err.message)) return '응답 시간이 초과되었습니다.';
    if (err.name === 'HttpError' && /network/i.test(err.message)) return '네트워크 오류가 발생했습니다.';
    if (/aborted/i.test(err.message || '')) return '취소되었습니다.';
    return err.message || '알 수 없는 오류';
  }