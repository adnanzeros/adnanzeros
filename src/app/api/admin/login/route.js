import { NextResponse } from 'next/server';
import {
  COOKIE,
  adminConfigured,
  cookieOptions,
  makeToken,
  credentialsMatch,
} from '../../../../lib/admin-auth.js';

const attempts = new Map(); // ip -> { n, until }

export async function POST(request) {
  if (!adminConfigured())
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not set on the server.' },
      { status: 500 },
    );

  const ip = (request.headers.get('x-forwarded-for') || 'local')
    .split(',')[0]
    .trim();
  const entry = attempts.get(ip);
  if (entry && entry.n >= 5 && entry.until > Date.now())
    return NextResponse.json(
      { error: 'Too many tries. Wait 10 minutes.' },
      { status: 429 },
    );

  const body = await request.json().catch(() => ({}));
  if (
    !credentialsMatch(
      String(body?.username ?? ''),
      String(body?.password ?? ''),
    )
  ) {
    const n = (entry && entry.until > Date.now() ? entry.n : 0) + 1;
    attempts.set(ip, { n, until: Date.now() + 10 * 60 * 1000 });
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json(
      { error: 'Wrong username or password.' },
      { status: 401 },
    );
  }
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, makeToken(), cookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
