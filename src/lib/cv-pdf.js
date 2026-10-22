import fs from "node:fs";

const INTRO_SESSION_KEY = "adnanzeros-intro-completed-v5";

function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL) {
    const host =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
        : process.env.VERCEL_URL;
    if (!host) {
      throw new Error("Set SITE_URL or VERCEL_URL to render the CV PDF.");
    }
    return `https://${host}`;
  }
  return `http://127.0.0.1:${process.env.PORT || 3000}`;
}

function localChrome() {
  const paths = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return paths.find(path => {
    try {
      return fs.existsSync(path);
    } catch {
      return false;
    }
  });
}

async function launchBrowser() {
  const { default: puppeteer } = await import("puppeteer-core");
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const { default: chromium } = await import("@sparticuz/chromium");
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({
        args: chromium.args,
        headless: "shell",
      }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  const executablePath = localChrome();
  if (!executablePath) {
    throw new Error(
      "Chrome/Edge not found. Set CHROME_PATH in .env.local to your chrome.exe path.",
    );
  }
  const runningAsRoot =
    typeof process.getuid === "function" && process.getuid() === 0;
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: runningAsRoot ? ["--no-sandbox"] : [],
  });
}

export async function renderCvPdf() {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(key => {
      if (window.location.origin !== "null") {
        window.sessionStorage.setItem(key, "played");
      }
    }, INTRO_SESSION_KEY);
    await page.goto(`${siteOrigin()}/cv`, {
      waitUntil: "load",
      timeout: 25000,
    });
    await page.evaluate(() =>
      Promise.race([
        Promise.all([
          document.fonts ? document.fonts.ready : 0,
          ...[...document.images].map(image =>
            image.complete
              ? 0
              : new Promise(resolve => {
                  image.onload = image.onerror = resolve;
                }),
          ),
        ]),
        new Promise(resolve => setTimeout(resolve, 6000)),
      ]),
    );
    await page.emulateMediaType("print");
    return Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      }),
    );
  } finally {
    await browser.close();
  }
}
