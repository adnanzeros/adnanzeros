import { NextResponse } from 'next/server';
import { Binary } from 'mongodb';
import { getDb } from '../../../../lib/db.js';
import { fail, guard } from '../../../../lib/admin-guard.js';

const MAX = 1.5 * 1024 * 1024;

function sniff(bytes) {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45)
    return 'image/webp';
  return null;
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  const buffer = Buffer.from(await request.arrayBuffer());
  if (!buffer.length || buffer.length > MAX)
    return NextResponse.json(
      { error: 'Image must be under 1.5 MB.' },
      { status: 400 },
    );
  const type = sniff(buffer);
  if (!type)
    return NextResponse.json(
      { error: 'Only JPG, PNG or WebP.' },
      { status: 400 },
    );
  try {
    const db = await getDb();
    const result = await db
      .collection('images')
      .insertOne({ type, data: new Binary(buffer), createdAt: new Date() });
    return NextResponse.json({ url: `/api/img/${result.insertedId}` });
  } catch (error) {
    return fail(error);
  }
}
