/* Tampermonkey stand-in shared by the test harnesses.
   GM_xmlhttpRequest routes through the local Node proxy so cross-origin
   calls behave the way the real GM API does (no CORS restrictions). */
(function () {
  if (window.GM_xmlhttpRequest) return;
  const store = new Map();
  window.GM_getValue = (k, d) => (store.has(k) ? store.get(k) : d);
  window.GM_setValue = (k, v) => store.set(k, v);
  window.GM_deleteValue = (k) => store.delete(k);
  window.GM_addStyle = (css) => {
    const s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  };
  window.GM_registerMenuCommand = (label, fn) => {
    (window.__menus ||= []).push({ label, fn });
  };
  window.GM_openInTab = (url) => window.open(url, '_blank');

  window.GM_xmlhttpRequest = function (opts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeout || 20000);
    const headers = {};
    for (const [k, v] of Object.entries(opts.headers || {})) headers['x-gm-' + k] = v;
    fetch('/__proxy?url=' + encodeURIComponent(opts.url), {
      method: opts.method || 'GET',
      headers,
      body: opts.data,
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timer);
        const payload = await res.json();
        opts.onload && opts.onload({
          status: payload.status,
          responseText: payload.text,
          responseHeaders: '',
        });
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') opts.ontimeout && opts.ontimeout();
        else opts.onerror && opts.onerror(err);
      });
    return { abort: () => controller.abort() };
  };
})();