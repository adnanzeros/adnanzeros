import { NextResponse } from "next/server";
import { renderCvPdf } from "../../../lib/cv-pdf.js";

export const runtime = "nodejs";
export const maxDuration = 30;

const FILE_NAME = "Adnan-Sami-CV.pdf";
const CACHE_MS = 5 * 60 * 1000;
let cache = { at: 0, buf: null };

async function handleRequest(request) {
  try {
    const useCache = !!process.env.VERCEL;
    if (!useCache || !cache.buf || Date.now() - cache.at > CACHE_MS) {
      cache = { at: Date.now(), buf: await renderCvPdf() };
    }

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
      "Content-Length": String(cache.buf.length),
      "Cache-Control": "public, max-age=0, s-maxage=600",
    });
    return new NextResponse(request.method === "HEAD" ? null : cache.buf, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("CV PDF error:", error);
    return NextResponse.json(
      { error: "Could not create the PDF right now." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  return handleRequest(request);
}

export async function HEAD(request) {
  return handleRequest(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET, HEAD" },
  });
}
