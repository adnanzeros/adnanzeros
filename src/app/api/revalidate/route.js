import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const path = body?.path ?? '/';
  if (typeof path !== 'string' || !path.startsWith('/')) {
    return Response.json({ error: 'Invalid path.' }, { status: 400 });
  }

  revalidatePath(path);
  return Response.json({ ok: true });
}
