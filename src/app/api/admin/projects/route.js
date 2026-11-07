import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { fail, guard } from '../../../../lib/admin-guard.js';
import {
  createProject,
  listAdminProjects,
  validateProject,
} from '../../../../lib/projects-store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ projects: await listAdminProjects() });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const { value, error } = validateProject(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const id = await createProject(value);
    revalidatePath('/');
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return fail(err);
  }
}
