'use client';

import { useCallback, useEffect, useState } from 'react';

const CATEGORIES = [
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['tools', 'Extensions'],
];
const EMPTY = {
  category: 'frontend',
  name: '',
  description: '',
  tags: '',
  url: '',
  repo: '',
  image: '',
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      (data.error || 'Request failed.') +
        (data.detail ? ` [${data.detail}]` : ''),
    );
  return data;
}

/* Upload er age browser e chhoto kore webp banay (max 1400px) */
async function compress(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const toBlob = (type, q) => new Promise(r => canvas.toBlob(r, type, q));
  let blob = await toBlob('image/webp', 0.82);
  if (!blob || blob.type !== 'image/webp')
    blob = await toBlob('image/jpeg', 0.82);
  for (let q = 0.7; blob.size > 1.4 * 1024 * 1024 && q > 0.3; q -= 0.15)
    blob = await toBlob(blob.type, q);
  return blob;
}

const svgProps = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
const UserIcon = () => (
  <svg {...svgProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const LockIcon = () => (
  <svg {...svgProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = ({ off }) =>
  off ? (
    <svg {...svgProps}>
      <path d="M17.94 17.94A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18.6 18.6 0 0 1 4.06-5.06" />
      <path d="M9.9 4.24A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <path d="M1 1l22 22" />
    </svg>
  ) : (
    <svg {...svgProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

function ErrorBox({ error, onRetry }) {
  return (
    <div className="adm-card adm-errbox">
      <p className="adm-err">{error}</p>
      <button className="adm-btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function Login({ configured, dbReady, onDone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-login">
      <form className="adm-auth" onSubmit={submit}>
        <div className="adm-logo">
          <img src="/favicon.svg" alt="" width="36" height="36" />
        </div>
        <h1>Welcome back</h1>
        <p className="adm-sub">Sign in to manage your portfolio</p>
        {!configured && (
          <p className="adm-warn">ADMIN_PASSWORD is not set on the server.</p>
        )}
        {configured && !dbReady && (
          <p className="adm-warn">
            MONGODB_URI is not set. Login works, data will not.
          </p>
        )}
        <label className="adm-field">
          <span>Username</span>
          <div className="adm-input">
            <UserIcon />
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Your username"
              autoFocus
            />
          </div>
        </label>
        <label className="adm-field">
          <span>Password</span>
          <div className="adm-input">
            <LockIcon />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Your password"
            />
            <button
              type="button"
              className="adm-eye"
              onClick={() => setShow(v => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
            >
              <EyeIcon off={show} />
            </button>
          </div>
        </label>
        {error && (
          <p className="adm-err" role="alert">
            {error}
          </p>
        )}
        <button
          className="adm-btn adm-solid adm-wide"
          disabled={busy || !password}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a className="adm-back" href="/">
          &larr; Back to site
        </a>
      </form>
    </main>
  );
}

function Messages() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      setItems((await api('/api/admin/messages')).messages);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function importOld() {
    setImporting(true);
    setNote('');
    try {
      const r = await api('/api/admin/messages/import', { method: 'POST' });
      setNote(
        `Imported ${r.imported} message(s)` +
          (r.remaining ? `, ${r.remaining} more left. Click again.` : '.'),
      );
      await load();
    } catch (err) {
      setNote(err.message);
    } finally {
      setImporting(false);
    }
  }

  async function toggle(m) {
    setItems(list =>
      list.map(x => (x.id === m.id ? { ...x, read: !m.read } : x)),
    );
    await api('/api/admin/messages', {
      method: 'PATCH',
      body: JSON.stringify({ id: m.id, read: !m.read }),
    }).catch(() => load());
  }
  async function remove(m) {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    setItems(list => list.filter(x => x.id !== m.id));
    await api('/api/admin/messages', {
      method: 'DELETE',
      body: JSON.stringify({ id: m.id }),
    }).catch(() => load());
  }

  if (error)
    return (
      <ErrorBox
        error={error}
        onRetry={() => {
          setError('');
          load();
        }}
      />
    );
  if (!items) return <p className="adm-dim">Loading…</p>;

  const bar = (
    <div className="adm-actions adm-bar">
      <button className="adm-btn" onClick={load}>
        Refresh
      </button>
      <button className="adm-btn" onClick={importOld} disabled={importing}>
        {importing ? 'Importing…' : 'Import from Resend'}
      </button>
      {note && <span className="adm-dim adm-note">{note}</span>}
    </div>
  );
  if (!items.length)
    return (
      <>
        {bar}
        <p className="adm-dim">No messages yet.</p>
      </>
    );

  return (
    <>
      {bar}
      <div className="adm-list">
        {items.map(m => (
          <article
            key={m.id}
            className={`adm-card adm-msg${m.read ? '' : ' unread'}`}
          >
            <header>
              <div>
                <strong>{m.name}</strong>
                <span className="adm-dim">
                  {' '}
                  · {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              {!m.read && <span className="adm-dot" title="Unread" />}
            </header>
            <p className="adm-meta">
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <a
                href={`https://wa.me/${m.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {m.whatsapp}
              </a>
            </p>
            <p className="adm-body">{m.message}</p>
            <footer>
              <button className="adm-btn" onClick={() => toggle(m)}>
                Mark {m.read ? 'unread' : 'read'}
              </button>
              <button className="adm-btn adm-danger" onClick={() => remove(m)}>
                Delete
              </button>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

function ProjectForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  async function pick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const blob = await compress(file);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Upload failed.');
      setForm(f => ({ ...f, image: data.url }));
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = JSON.stringify({ ...form, tags: form.tags });
      if (form.id)
        await api(`/api/admin/projects/${form.id}`, { method: 'PUT', body });
      else await api('/api/admin/projects', { method: 'POST', body });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-card adm-form" onSubmit={submit}>
      <h2>{form.id ? 'Edit project' : 'Add project'}</h2>
      <div className="adm-row">
        <label>
          Name
          <input
            value={form.name}
            onChange={set('name')}
            maxLength={80}
            required
          />
        </label>
        <label>
          Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea
          rows={3}
          value={form.description}
          onChange={set('description')}
          maxLength={400}
          required
        />
      </label>
      <label>
        Tags (comma diye)
        <input
          value={form.tags}
          onChange={set('tags')}
          placeholder="React, Next.js, MongoDB"
        />
      </label>
      <div className="adm-row">
        <label>
          Live link
          <input
            value={form.url}
            onChange={set('url')}
            placeholder="https://…"
          />
        </label>
        <label>
          GitHub link
          <input
            value={form.repo}
            onChange={set('repo')}
            placeholder="https://github.com/…"
          />
        </label>
      </div>
      <div className="adm-image">
        <span>Image</span>
        {form.image && <img src={form.image} alt="" />}
        <div className="adm-actions">
          <label className="adm-btn adm-file">
            {uploading
              ? 'Uploading…'
              : form.image
                ? 'Change image'
                : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              onChange={pick}
              hidden
              disabled={uploading}
            />
          </label>
          {form.image && (
            <button
              type="button"
              className="adm-btn"
              onClick={() => setForm(f => ({ ...f, image: '' }))}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="adm-err">{error}</p>}
      <div className="adm-actions">
        <button className="adm-btn adm-solid" disabled={busy || uploading}>
          {busy ? 'Saving…' : 'Save project'}
        </button>
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Projects() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems((await api('/api/admin/projects')).projects);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/api/admin/projects/${p.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error)
    return (
      <ErrorBox
        error={error}
        onRetry={() => {
          setError('');
          load();
        }}
      />
    );
  if (!items) return <p className="adm-dim">Loading…</p>;

  if (editing)
    return (
      <ProjectForm
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );

  return (
    <>
      <button
        className="adm-btn adm-solid"
        onClick={() => setEditing({ ...EMPTY })}
      >
        + Add project
      </button>
      <div className="adm-list">
        {items.map(p => (
          <article key={p.id} className="adm-card adm-proj">
            {p.image ? (
              <img src={p.image} alt="" />
            ) : (
              <div className="adm-noimg">No image</div>
            )}
            <div className="adm-proj-body">
              <strong>{p.name}</strong>
              <span className="adm-tag">{p.category}</span>
              <p className="adm-dim">{p.description}</p>
            </div>
            <div className="adm-actions">
              <button
                className="adm-btn"
                onClick={() =>
                  setEditing({
                    ...EMPTY,
                    ...p,
                    tags: (p.tags || []).join(', '),
                  })
                }
              >
                Edit
              </button>
              <button className="adm-btn adm-danger" onClick={() => remove(p)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function AdminApp({ initialAuthed, configured, dbReady }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [tab, setTab] = useState('messages');

  async function logout() {
    await api('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    setAuthed(false);
  }

  if (!authed)
    return (
      <Login
        configured={configured}
        dbReady={dbReady}
        onDone={() => setAuthed(true)}
      />
    );

  return (
    <main className="adm-wrap">
      <header className="adm-top">
        <h1>Admin</h1>
        <nav>
          <button
            className={tab === 'messages' ? 'on' : ''}
            onClick={() => setTab('messages')}
          >
            Messages
          </button>
          <button
            className={tab === 'projects' ? 'on' : ''}
            onClick={() => setTab('projects')}
          >
            Projects
          </button>
        </nav>
        <div className="adm-actions">
          <a
            className="adm-btn"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            View site
          </a>
          <button className="adm-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      {tab === 'messages' ? <Messages /> : <Projects />}
    </main>
  );
}
