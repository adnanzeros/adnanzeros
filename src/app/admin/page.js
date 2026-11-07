import AdminApp from './AdminApp';
import { adminConfigured, isAdmin } from '../../lib/admin-auth';
import { hasDb } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAdmin();
  return (
    <AdminApp
      initialAuthed={authed}
      configured={adminConfigured()}
      dbReady={hasDb()}
    />
  );
}
