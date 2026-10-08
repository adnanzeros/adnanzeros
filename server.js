// Local dev server (no dependencies). Serves the site and runs api/contact.js using .env.local.
// On Vercel this file is NOT used: Vercel serves the static files and api/ folder by itself.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Tiny .env loader, works on every Node version (no dependency on process.loadEnvFile).
function loadEnv(file) {
  try {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
    return true;
  } catch {
    return false;
  }
}
if (
  !loadEnv(path.join(root, '.env.local')) &&
  !loadEnv(path.join(root, '.env'))
)
  console.warn(
    '! .env.local not found: the contact form cannot send mail until you create it (see .env.example)',
  );
else if (!process.env.RESEND_API_KEY)
  console.warn('! RESEND_API_KEY is empty in .env.local');

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
};
const BLOCKED = /^(\.|api\/|server\.js|package|readme|node_modules)/i;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1e5) break;
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/contact' || url.pathname === '/api/cv') {
        const file =
          url.pathname === '/api/cv' ? 'api/cv.js' : 'api/contact.js';
        const { default: handler } = await import(
          pathToFileURL(path.join(root, file)).href
        );
        req.body = req.method === 'POST' ? await readBody(req) : {};
        res.status = c => {
          res.statusCode = c;
          return res;
        };
        res.json = o => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(o));
        };
        return await handler(req, res);
      }
      const rel =
        decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.join(root, rel);
      if (
        !file.startsWith(root) ||
        BLOCKED.test(rel) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      res.setHeader(
        'Content-Type',
        MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      );
      fs.createReadStream(file).pipe(res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ error: 'Server error' }));
    }
  })
  .listen(PORT, () =>
    console.log(
      `\n  adnanzeros portfolio running:  http://localhost:${PORT}\n`,
    ),
  );
