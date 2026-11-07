import { NextResponse } from 'next/server';
import { isAdmin } from './admin-auth.js';
import { hasDb } from './db.js';

/* null return korle ok, noile response ta return koro */
export async function guard() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  if (!hasDb())
    return NextResponse.json(
      { error: 'MONGODB_URI is missing. Add it to .env.local / Vercel env.' },
      { status: 500 },
    );
  return null;
}

export const fail = (error, status = 500) => {
  console.error('[admin]', error);
  const raw = String(error?.message || error || '');
  let hint = 'Server error. Check the terminal logs.';
  if (/Authentication failed|bad auth/i.test(raw))
    hint =
      'MongoDB login failed: username or password in MONGODB_URI is wrong (did you change the Atlas password?).';
  else if (
    /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timed out|Server selection|ReplicaSetNoPrimary|tls|ssl/i.test(
      raw,
    )
  )
    hint =
      'Cannot reach MongoDB. In Atlas > Network Access add your current IP (or 0.0.0.0/0), and check your internet.';
  const body = { error: hint };
  if (process.env.NODE_ENV !== 'production') body.detail = raw.slice(0, 220);
  return NextResponse.json(body, { status });
};
