import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/db.js';
import { fail, guard } from '../../../../lib/admin-guard.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const db = await getDb();
    const docs = await db
      .collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray();
    return NextResponse.json({
      messages: docs.map(d => ({
        id: String(d._id),
        name: d.name,
        email: d.email,
        whatsapp: d.whatsapp,
        message: d.message,
        read: Boolean(d.read),
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request) {
  const denied = await guard();
  if (denied) return denied;
  const { id, read } = await request.json().catch(() => ({}));
  if (!ObjectId.isValid(id))
    return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
  try {
    const db = await getDb();
    await db
      .collection('messages')
      .updateOne({ _id: new ObjectId(id) }, { $set: { read: Boolean(read) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await request.json().catch(() => ({}));
  if (!ObjectId.isValid(id))
    return NextResponse.json({ error: 'Bad id.' }, { status: 400 });
  try {
    const db = await getDb();
    await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
