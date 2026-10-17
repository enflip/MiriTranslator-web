// Minimal static file server + a GM_xmlhttpRequest stand-in for local testing.
//   node test/server.mjs [port]
//
// The /__proxy route performs the request from Node so the harness behaves
// like Tampermonkey (cross-origin requests are *not* blocked by CORS).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8123);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function proxy(req, res, target) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (k.startsWith('x-gm-')) headers[k.slice(5)] = v;
  }
  if (body.length) headers['content-length'] = String(body.length);
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body.length ? body : undefined,
      redirect: 'follow',
    });
    const text = await upstream.text();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-GM-Status': String(upstream.status),
    });
    res.end(JSON.stringify({ status: upstream.status, text }));
  } catch (err) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-GM-Status': '0',
    });
    res.end(JSON.stringify({ status: 0, text: String(err && err.message) }));
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === '/__proxy') return proxy(req, res, url.searchParams.get('url'));

    let path = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, ''));
    const info = await stat(path).catch(() => null);
    if (!info || info.isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}/test/harness.html`));