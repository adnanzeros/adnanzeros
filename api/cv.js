// Serverless function (Vercel) + also used by server.js locally.
// Opens your LIVE cv.html in a headless browser and returns it as a real, one-page A4 PDF
// (selectable text + clickable links). Edit cv.html and the PDF changes with it: there is no separate PDF file.
import fs from 'node:fs';

const FILE_NAME = 'Adnan-Sami-CV.pdf';
let cache = { at: 0, buf: null }; // keeps the PDF for a few minutes so repeated clicks are instant
const CACHE_MS = 5 * 60 * 1000;

// Where is the site? Never taken from the request headers (that would let strangers aim the browser at any URL).
function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  if (process.env.VERCEL) {
    const host =
      process.env.VERCEL_ENV === 'production'
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
        : process.env.VERCEL_URL;
    return 'https://' + host;
  }
  return `http://127.0.0.1:${process.env.PORT || 3000}`;
}

// Local development: use the Chrome / Edge that is already installed on your computer.
function localChrome() {
  const list = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return list.find(p => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
}

async function launch() {
  const { default: puppeteer } = await import('puppeteer-core'); // loaded only when this endpoint is used
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const { default: chromium } = await import('@sparticuz/chromium');
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({
        args: chromium.args,
        headless: 'shell',
      }),
      executablePath: await chromium.executablePath(),
      headless: 'shell',
    });
  }
  const executablePath = localChrome();
  if (!executablePath)
    throw new Error(
      'Chrome/Edge not found. Set CHROME_PATH in .env.local to your chrome.exe path.',
    );
  const root = typeof process.getuid === 'function' && process.getuid() === 0; // Docker / root shells need this
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: root ? ['--no-sandbox'] : [],
  });
}

async function render() {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.goto(siteOrigin() + '/cv.html', {
      waitUntil: 'load',
      timeout: 25000,
    });
    // wait for the web font + photo, but never longer than a few seconds
    await page.evaluate(() =>
      Promise.race([
        Promise.all([
          document.fonts ? document.fonts.ready : 0,
          ...[...document.images].map(i =>
            i.complete
              ? 0
              : new Promise(r => {
                  i.onload = i.onerror = r;
                }),
          ),
        ]),
        new Promise(r => setTimeout(r, 6000)),
      ]),
    );
    await page.emulateMediaType('print');
    return Buffer.from(
      await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      }),
    );
  } finally {
    await browser.close();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    // cache only online; on your computer every click uses the latest cv.html
    const useCache = !!process.env.VERCEL;
    if (!useCache || !cache.buf || Date.now() - cache.at > CACHE_MS)
      cache = { at: Date.now(), buf: await render() };
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${FILE_NAME}"`);
    res.setHeader('Content-Length', cache.buf.length);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600');
    return res.end(req.method === 'HEAD' ? undefined : cache.buf);
  } catch (err) {
    console.error('CV PDF error:', err);
    return res
      .status(500)
      .json({ error: 'Could not create the PDF right now.' });
  }
}
