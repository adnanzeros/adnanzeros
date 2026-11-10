// FILE: adnanzeros/adnanzeros/src/app/admin/SettingsPanel.jsx  (NOTUN file)
'use client';

/* Settings: team members (admin / moderator / viewer), tader gmail, password ar task select */
import { useCallback, useEffect, useState } from 'react';

const TASKS = [
  ['blog', 'Blog', 'Write, edit and delete blog posts'],
  ['projects', 'Projects', 'Manage portfolio projects'],
  ['messages', 'Messages', 'Read and reply to inbox messages'],
];
const ROLES = [
  ['admin', 'Admin', 'Full access + Settings'],
  ['moderator', 'Moderator', 'Can edit the tasks you pick'],
  ['viewer', 'Viewer', 'Can only view the tasks you pick'],
];
const EMPTY = {
  name: '',
  email: '',
  password: '',
  role: 'moderator',
  permissions: ['blog'],
  active: true,
};

const makePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, n => chars[n % chars.length]).join('');
};

export default function SettingsPanel({
  kit,
  notify,
  requestConfirm,
  isOwner,
}) {
  const { api, Icon, ErrorBox, Skeleton } = kit;
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null); // null = closed, {id?} = editing
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setUsers((await api('/api/admin/users')).users);
    } catch (e) {
      setError(e.message);
    }
  }, [api]);
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!users) return <Skeleton cards={3} />;

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const toggleTask = key =>
    set(
      'permissions',
      form.permissions.includes(key)
        ? form.permissions.filter(k => k !== key)
        : [...form.permissions, key],
    );

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        role: form.role,
        permissions:
          form.role === 'admin' ? TASKS.map(t => t[0]) : form.permissions,
        active: form.active,
        ...(form.password ? { password: form.password } : {}),
      };
      if (form.id) {
        await api(`/api/admin/users/${form.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      notify(form.id ? 'Member updated.' : 'Member added.', 'success');
      setForm(null);
      load();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  function remove(user) {
    requestConfirm({
      title: 'Remove this member?',
      message: `${user.name} (${user.email}) will lose access and be deleted from the database.`,
      confirmLabel: 'Remove',
      onConfirm: async () => {
        try {
          await api(`/api/admin/users/${user.id}`, { method: 'DELETE' });
          setUsers(list => list.filter(u => u.id !== user.id));
          notify('Member removed.', 'success');
        } catch (e) {
          notify(e.message, 'error');
        }
      },
    });
  }

  async function toggleActive(user) {
    try {
      await api(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active }),
      });
      setUsers(list =>
        list.map(u => (u.id === user.id ? { ...u, active: !u.active } : u)),
      );
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  const canEdit = u => isOwner || u.role !== 'admin';
  const roles = ROLES.filter(([value]) => isOwner || value !== 'admin');

  return (
    <div className="adm-settings">
      <section className="adm-welcome">
        <div>
          <p className="adm-eyebrow">SETTINGS</p>
          <h1>Team &amp; access</h1>
          <p className="adm-muted">
            Give someone a Gmail + password, pick a role and the tasks they can
            use.
          </p>
        </div>
        <button
          className="adm-button adm-button-primary"
          onClick={() => {
            setShowPass(false);
            setForm({ ...EMPTY });
          }}
        >
          <Icon name="users" size={17} /> Add member
        </button>
      </section>

      {form && (
        <form className="adm-panel adm-member-form" onSubmit={save}>
          <div className="adm-section-heading">
            <div>
              <p className="adm-eyebrow">
                {form.id ? 'EDIT MEMBER' : 'NEW MEMBER'}
              </p>
              <h2>{form.id ? form.name || 'Member' : 'Add a team member'}</h2>
            </div>
          </div>

          <div className="adm-form-grid">
            <label className="adm-field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Rahim"
                required
              />
            </label>
            <label className="adm-field">
              <span>Gmail (login email)</span>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="name@gmail.com"
                required
              />
            </label>
            <label className="adm-field adm-field-wide">
              <span>
                {form.id
                  ? 'New password (leave empty to keep the old one)'
                  : 'Password'}
              </span>
              <div className="adm-pass-row">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required={!form.id}
                />
                <button
                  type="button"
                  className="adm-button adm-button-secondary"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  className="adm-button adm-button-secondary"
                  onClick={() => {
                    set('password', makePassword());
                    setShowPass(true);
                  }}
                >
                  Generate
                </button>
              </div>
            </label>
          </div>

          <p className="adm-eyebrow adm-form-label">ROLE</p>
          <div className="adm-role-grid">
            {roles.map(([value, label, hint]) => (
              <button
                type="button"
                key={value}
                className={`adm-role-card${form.role === value ? ' adm-role-on' : ''}`}
                onClick={() => set('role', value)}
              >
                <strong>{label}</strong>
                <small>{hint}</small>
              </button>
            ))}
          </div>

          <p className="adm-eyebrow adm-form-label">
            TASKS {form.role === 'admin' && '(admin gets everything)'}
          </p>
          <div className="adm-task-grid">
            {TASKS.map(([key, label, hint]) => {
              const on =
                form.role === 'admin' || form.permissions.includes(key);
              return (
                <label
                  className={`adm-task${on ? ' adm-task-on' : ''}`}
                  key={key}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={form.role === 'admin'}
                    onChange={() => toggleTask(key)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="adm-modal-actions adm-form-actions">
            <button
              type="button"
              className="adm-button adm-button-secondary"
              onClick={() => setForm(null)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="adm-button adm-button-primary" disabled={busy}>
              {busy ? 'Saving…' : form.id ? 'Save changes' : 'Create member'}
            </button>
          </div>
        </form>
      )}

      <section className="adm-panel">
        <div className="adm-section-heading">
          <div>
            <p className="adm-eyebrow">MEMBERS</p>
            <h2>
              {users.length ? `${users.length} with access` : 'No members yet'}
            </h2>
          </div>
        </div>
        {users.length ? (
          <ul className="adm-member-list">
            {users.map(u => (
              <li key={u.id} className={u.active ? '' : 'adm-member-off'}>
                <span className="adm-avatar">
                  {u.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="adm-member-info">
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                  <div className="adm-chips">
                    <span className={`adm-chip adm-chip-${u.role}`}>
                      {u.role}
                    </span>
                    {u.permissions.map(p => (
                      <span className="adm-chip" key={p}>
                        {p}
                      </span>
                    ))}
                    {!u.active && (
                      <span className="adm-chip adm-chip-off">disabled</span>
                    )}
                  </div>
                </div>
                {canEdit(u) && (
                  <div className="adm-inline-actions">
                    <button
                      className="adm-button adm-button-secondary"
                      onClick={() => toggleActive(u)}
                    >
                      {u.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="adm-button adm-button-secondary"
                      onClick={() => {
                        setShowPass(false);
                        setForm({ ...u, password: '' });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="adm-button adm-button-danger"
                      onClick={() => remove(u)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-empty-inline">
            Add your first moderator or viewer above.
          </p>
        )}
      </section>
    </div>
  );
}
