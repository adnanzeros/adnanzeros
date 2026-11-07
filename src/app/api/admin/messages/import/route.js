import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db.js';
import { fail, guard } from '../../../../../lib/admin-guard.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PER_CLICK = 8; // ek click e max koyta email porbo (Resend rate limit er jonno)
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function resend(path) {
  const res = await fetch(`https://api.resend.com${path}`, {
    headers: {
      Authorization: `Bearer ${(process.env.RESEND_API_KEY || '').trim()}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Resend HTTP ${res.status}`);
    error.resend = true;
    error.status = res.status;
    throw error;
  }
  return data;
}

/* contact.js e pathano email er text format theke data ber kori */
function parse(text) {
  const m =
    /Name:\s*(.*)\nEmail:\s*(.*)\nWhatsApp:\s*(.*)\nChat:.*\n\n([\s\S]*)$/.exec(
      String(text || '').replace(/\r/g, ''),
    );
  if (!m) return null;
  return {
    name: m[1].trim(),
    email: m[2].trim(),
    whatsapp: m[3].trim(),
    message: m[4].trim(),
  };
}

export async function POST() {
  const denied = await guard();
  if (denied) return denied;
  if (!(process.env.RESEND_API_KEY || '').trim())
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not set.' },
      { status: 400 },
    );

  try {
    const list = await resend('/emails?limit=100');
    const items = (Array.isArray(list) ? list : list.data || []).filter(e =>
      /^New message from/.test(e.subject || ''),
    );
    const db = await getDb();
    const messages = db.collection('messages');
    const skipped = db.collection('resend_skipped');

    let imported = 0;
    let fetched = 0;
    let remaining = 0;
    for (const item of items) {
      if (await messages.findOne({ resendId: item.id })) continue;
      if (await skipped.findOne({ _id: item.id })) continue;
      if (fetched >= PER_CLICK) {
        remaining++;
        continue;
      }
      fetched++;
      await sleep(600);
      const full = await resend(`/emails/${item.id}`);
      const data = parse(full.text);
      if (!data) {
        await skipped.insertOne({ _id: item.id });
        continue;
      }
      /* already DB te thakle (notun flow theke save) shudhu id mark kori */
      const dup = await messages.updateOne(
        {
          email: data.email,
          message: data.message,
          resendId: { $exists: false },
        },
        { $set: { resendId: item.id } },
      );
      if (dup.matchedCount) continue;
      await messages.insertOne({
        ...data,
        resendId: item.id,
        read: true,
        createdAt: new Date(full.created_at || item.created_at || Date.now()),
      });
      imported++;
    }
    return NextResponse.json({ ok: true, imported, remaining });
  } catch (error) {
    if (error.resend && (error.status === 401 || error.status === 403))
      return NextResponse.json(
        {
          error:
            'Resend key cannot read sent emails. Create a new Resend API key with Full access and put it in RESEND_API_KEY.',
        },
        { status: 400 },
      );
    return fail(error);
  }
}
