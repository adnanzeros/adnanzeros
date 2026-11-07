import { ObjectId } from 'mongodb';
import { getDb, hasDb } from '../../../../lib/db.js';

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!hasDb() || !ObjectId.isValid(id))
    return new Response('Not found', { status: 404 });
  try {
    const db = await getDb();
    const doc = await db
      .collection('images')
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return new Response('Not found', { status: 404 });
    return new Response(doc.data.buffer, {
      headers: {
        'Content-Type': doc.type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[img]', error);
    return new Response('Error', { status: 500 });
  }
}
