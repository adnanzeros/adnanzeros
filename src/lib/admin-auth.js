import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 din

const secret = () =>
  (process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '').trim();

const sign = value =>
  crypto.createHmac('sha256', secret()).update(value).digest('hex');

const sha = value => crypto.createHash('sha256').update(String(value)).digest();

export const adminConfigured = () =>
  Boolean((process.env.ADMIN_PASSWORD || '').trim());

export function credentialsMatch(username, password) {
  const expected = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expected) return false;
  const passOk = crypto.timingSafeEqual(sha(password), sha(expected));
  const expectedUser = (process.env.ADMIN_USERNAME || '').trim();
  /* ADMIN_USERNAME set thakle username o milte hobe */
  const userOk = expectedUser
    ? crypto.timingSafeEqual(sha(username), sha(expectedUser))
    : true;
  return passOk && userOk;
}

export function makeToken() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  return `${expires}.${sign(expires)}`;
}

function tokenValid(token) {
  if (!token || !secret()) return false;
  const [expires, signature] = String(token).split('.');
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  const good = sign(expires);
  if (good.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(good), Buffer.from(signature));
}

export async function isAdmin() {
  const store = await cookies();
  return tokenValid(store.get(COOKIE)?.value);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
};
