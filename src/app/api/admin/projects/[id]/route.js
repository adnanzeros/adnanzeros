import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { fail, guard } from '../../../../../lib/admin-guard.js';
import {
  deleteProject,
  updateProject,
  validateProject,
} from '../../../../../lib/projects-store.js';

export async function PUT(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { value, error } = validateProject(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    if (!(await updateProject(id, value)))
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 },
      );
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  try {
    if (!(await deleteProject(id)))
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 },
      );
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
