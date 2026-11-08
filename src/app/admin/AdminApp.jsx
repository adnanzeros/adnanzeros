'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CATEGORIES = [
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['tools', 'Extensions'],
];
const TABS = ['dashboard', 'messages', 'projects'];
const EMPTY_PROJECT = {
  category: 'frontend',
  name: '',
  description: '',
  tags: '',
  url: '',
  repo: '',
  image: '',
};
const ICONS = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
  messages: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
  projects: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M9 4v5" /></>,
  blog: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 7h8M8 11h8" /></>,
  products: <><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5M12 13v8" /></>,
  payments: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M7 15h3" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z" />,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  external: <><path d="M14 3h7v7M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.5-2L20 12M4 12l2.9 5a7 7 0 0 0 11.5-2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
  edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 4.2z" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
  upload: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3z" /><path d="m19 14 1 2.5 2 1-2 1L19 21l-1-2.5-2-1 2-1 1-2.5z" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 4-5" /><path d="M10 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = data.error || `Request failed (${response.status}).`;
    throw new Error(data.detail ? `${message} ${data.detail}` : message);
  }
  return data;
}

function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function ErrorBox({ error, onRetry }) {
  return (
    <div className="adm-error-box" role="alert">
      <div>
        <strong>We couldn&apos;t load this view.</strong>
        <p>{error}</p>
      </div>
      <button className="adm-button adm-button-secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function Skeleton({ cards = 3 }) {
  return (
    <div className="adm-skeleton-grid" aria-label="Loading content">
      {Array.from({ length: cards }, (_, index) => (
        <div className="adm-skeleton-card" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="adm-icon-button"
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}

function Login({ configured, dbReady, serverError, theme, onToggleTheme, onDone, onRetry }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`adm-login-page adm-theme-${theme}`}>
      <div className="adm-login-tools">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="adm-login-layout">
        <section className="adm-brand-panel">
          <a className="adm-brand-mark" href="/" aria-label="adnanzeros home">
            <img src="/favicon.svg" alt="" width="42" height="42" />
          </a>
          <p className="adm-eyebrow">PORTFOLIO CONTROL ROOM</p>
          <h1>Make good work easier to share.</h1>
          <p className="adm-brand-copy">
            Your projects, conversations, and next ideas — all in one calm
            workspace.
          </p>
          <ul className="adm-feature-list">
            <li><Icon name="check" size={18} /> Keep your portfolio current</li>
            <li><Icon name="check" size={18} /> Stay on top of new messages</li>
            <li><Icon name="check" size={18} /> Make every detail feel like you</li>
          </ul>
          <div className="adm-brand-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
        <form className="adm-login-card" onSubmit={submit}>
          <div className="adm-login-card-heading">
            <div className="adm-login-logo"><Icon name="sparkle" size={23} /></div>
            <div>
              <p className="adm-eyebrow">WELCOME BACK</p>
              <h2>Sign in</h2>
            </div>
          </div>
          <p className="adm-muted adm-login-intro">
            Use your server admin credentials to continue.
          </p>
          {configured === false && (
            <p className="adm-warning">
              ADMIN_PASSWORD is not set on the server.
            </p>
          )}
          {dbReady === false && (
            <p className="adm-warning">
              MONGODB_URI is not set. Login works, data will not.
            </p>
          )}
          {serverError && (
            <div className="adm-server-warning" role="alert">
              <p>Could not check the admin session: {serverError}</p>
              <button className="adm-text-button" type="button" onClick={onRetry}>Retry connection</button>
            </div>
          )}
          <label className="adm-field">
            <span>Username</span>
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Your username"
              required
            />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <span className="adm-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Your password"
                required
              />
              <button
                className="adm-password-toggle"
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </span>
          </label>
          {error && <p className="adm-form-error" role="alert">{error}</p>}
          <button className="adm-button adm-button-primary adm-login-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Continue'}
            {!busy && <Icon name="arrow" size={18} />}
          </button>
          <a className="adm-back-link" href="/">← Back to portfolio</a>
        </form>
      </div>
      <p className="adm-login-footer">A little space to keep your work in motion.</p>
    </main>
  );
}

function CountUp({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setCount(target);
      return;
    }
    let frame;
    const start = performance.now();
    const animate = now => {
      const progress = Math.min((now - start) / 650, 1);
      setCount(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{new Intl.NumberFormat().format(count)}</>;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function utcDays() {
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start - (6 - index) * 86400000);
    return {
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' }),
    };
  });
}

function Dashboard({ onOpenMessages }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try {
      setStats(await api('/api/admin/stats'));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!stats) return <Skeleton cards={5} />;

  const days = utcDays();
  const maxMessages = Math.max(1, ...days.map(day => Number(stats.perDay?.[day.key] || 0)));
  const categories = stats.projects?.byCategory || {};
  const projectTotal = Number(stats.projects?.total || 0);
  const recent = Array.isArray(stats.recent) ? stats.recent : [];
  const cards = [
    { label: 'Total messages', value: stats.messages?.total, icon: 'messages', tone: 'blue' },
    { label: 'Unread messages', value: stats.messages?.unread, icon: 'sparkle', tone: 'peach' },
    { label: 'Projects live', value: stats.projects?.total, icon: 'projects', tone: 'lavender' },
    { label: 'This week', value: stats.messages?.week, icon: 'arrow', tone: 'green' },
  ];

  return (
    <div className="adm-dashboard">
      <section className="adm-welcome">
        <div>
          <p className="adm-eyebrow">YOUR SPACE, AT A GLANCE</p>
          <h1>{greeting()}, Adnan <span aria-hidden="true">✦</span></h1>
          <p className="adm-muted">Here&apos;s what&apos;s happening with your portfolio.</p>
        </div>
        <button className="adm-button adm-button-secondary" onClick={load}>
          <Icon name="refresh" size={17} /> Refresh
        </button>
      </section>

      <section className="adm-stat-grid" aria-label="Portfolio statistics">
        {cards.map(card => (
          <article className={`adm-stat-card adm-tone-${card.tone}`} key={card.label}>
            <span className="adm-stat-icon"><Icon name={card.icon} size={19} /></span>
            <p>{card.label}</p>
            <strong><CountUp value={card.value} /></strong>
            <span className="adm-stat-caption">
              {card.label === 'This week' ? 'in the last 7 days' : 'all time'}
            </span>
          </article>
        ))}
      </section>

      <div className="adm-dashboard-grid">
        <section className="adm-panel adm-chart-panel">
          <div className="adm-section-heading">
            <div><p className="adm-eyebrow">INBOX ACTIVITY</p><h2>Messages this week</h2></div>
            <span className="adm-chart-total">{Number(stats.messages?.week || 0)} total</span>
          </div>
          <div className="adm-chart" role="img" aria-label="Messages received each of the last seven days">
            {days.map(day => {
              const value = Number(stats.perDay?.[day.key] || 0);
              return (
                <div className="adm-chart-column" key={day.key}>
                  <span className="adm-chart-value">{value || ''}</span>
                  <div className="adm-chart-track">
                    <span style={{ height: `${Math.max(7, (value / maxMessages) * 100)}%` }} />
                  </div>
                  <span className="adm-chart-label">{day.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="adm-panel adm-category-panel">
          <div className="adm-section-heading">
            <div><p className="adm-eyebrow">YOUR SHOWCASE</p><h2>Projects by category</h2></div>
            <span className="adm-chart-total">{projectTotal} total</span>
          </div>
          <div className="adm-meter-list">
            {CATEGORIES.map(([key, label]) => {
              const amount = Number(categories[key] || 0);
              const percent = projectTotal ? (amount / projectTotal) * 100 : 0;
              return (
                <div className="adm-meter" key={key}>
                  <div><span>{label}</span><strong>{amount}</strong></div>
                  <span className="adm-meter-track"><span style={{ width: `${percent}%` }} /></span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="adm-panel adm-recent-panel">
        <div className="adm-section-heading">
          <div><p className="adm-eyebrow">FRESH FROM YOUR INBOX</p><h2>Recent messages</h2></div>
          <button className="adm-text-button" onClick={onOpenMessages}>
            All messages <Icon name="arrow" size={16} />
          </button>
        </div>
        {recent.length ? (
          <div className="adm-recent-list">
            {recent.slice(0, 4).map(message => (
              <button
                className="adm-recent-row"
                key={message.id}
                onClick={() => onOpenMessages(message.id)}
              >
                <span className="adm-avatar">{initials(message.name)}</span>
                <span className="adm-recent-copy">
                  <strong>{message.name || 'Anonymous'}</strong>
                  <span>{message.message}</span>
                </span>
                <span className="adm-recent-date">{timeAgo(message.createdAt)}</span>
                {!message.read && <span className="adm-unread-dot" />}
              </button>
            ))}
          </div>
        ) : <p className="adm-empty-inline">No messages to show yet.</p>}
      </section>

      <section className="adm-soon-grid" aria-label="Coming soon">
        {[
          ['blog', 'A home for your thoughts', 'Blog'],
          ['products', 'Things you can share or sell', 'Products'],
          ['payments', 'A smoother way to get paid', 'Payments'],
        ].map(([icon, description, title]) => (
          <article className="adm-soon-card" key={title}>
            <span><Icon name={icon} size={19} /></span>
            <div><p className="adm-eyebrow">COMING SOON</p><h3>{title}</h3><p>{description}</p></div>
          </article>
        ))}
      </section>
    </div>
  );
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || '?';
}

function timeAgo(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Just now';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString();
}

function Messages({ selectedId, notify, requestConfirm, onUnreadChanged }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const openedSelectedRef = useRef(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api('/api/admin/messages');
      setItems(Array.isArray(data.messages) ? data.messages : []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (selectedId && items && openedSelectedRef.current !== selectedId) {
      const message = items.find(item => item.id === selectedId);
      if (message) {
        openedSelectedRef.current = selectedId;
        openMessage(message);
      }
    }
  }, [selectedId, items]);

  async function openMessage(message) {
    if (expanded === message.id) {
      setExpanded(null);
      return;
    }
    setExpanded(message.id);
    if (message.read) return;
    setItems(current => current.map(item => item.id === message.id ? { ...item, read: true } : item));
    try {
      await api('/api/admin/messages', {
        method: 'PATCH',
        body: JSON.stringify({ id: message.id, read: true }),
      });
      onUnreadChanged();
    } catch (updateError) {
      notify(updateError.message, 'error');
      load();
    }
  }

  async function toggleRead(message) {
    const read = !message.read;
    setItems(current => current.map(item => item.id === message.id ? { ...item, read } : item));
    try {
      await api('/api/admin/messages', {
        method: 'PATCH',
        body: JSON.stringify({ id: message.id, read }),
      });
      onUnreadChanged();
      notify(read ? 'Message marked as read.' : 'Message marked as unread.', 'success');
    } catch (updateError) {
      notify(updateError.message, 'error');
      load();
    }
  }

  async function remove(message) {
    try {
      await api('/api/admin/messages', {
        method: 'DELETE',
        body: JSON.stringify({ id: message.id }),
      });
      setItems(current => current.filter(item => item.id !== message.id));
      setExpanded(null);
      onUnreadChanged();
      notify('Message deleted.', 'success');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  }

  async function importMessages() {
    setImporting(true);
    try {
      const result = await api('/api/admin/messages/import', { method: 'POST' });
      const imported = Number(result.imported || 0);
      const remaining = Number(result.remaining || 0);
      notify(
        `Imported ${imported} message${imported === 1 ? '' : 's'}${remaining > 0 ? `. ${remaining} remain — click Import from Resend again.` : '.'}`,
        'success',
        6000,
      );
      await load();
    } catch (importError) {
      notify(importError.message, 'error');
    } finally {
      setImporting(false);
    }
  }

  const unread = items?.filter(item => !item.read).length || 0;
  const read = (items?.length || 0) - unread;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (items || []).filter(message => {
      const matchesFilter = filter === 'all' || (filter === 'unread' ? !message.read : message.read);
      const matchesSearch = !query || [message.name, message.email, message.whatsapp, message.message]
        .some(value => String(value || '').toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [filter, items, search]);

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!items) return <Skeleton cards={4} />;

  return (
    <div className="adm-view-content">
      <div className="adm-page-heading">
        <div><p className="adm-eyebrow">YOUR INBOX</p><h1>Messages</h1><p className="adm-muted">A little hello can turn into something great.</p></div>
        <div className="adm-toolbar">
          <button className="adm-button adm-button-secondary" onClick={load}><Icon name="refresh" size={17} /> Refresh</button>
          <button className="adm-button adm-button-primary" onClick={importMessages} disabled={importing}>
            {importing ? 'Importing…' : 'Import from Resend'}
          </button>
        </div>
      </div>
      <div className="adm-message-tools">
        <label className="adm-search">
          <Icon name="search" size={19} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search messages…" />
        </label>
        <div className="adm-segment" aria-label="Filter messages">
          {[
            ['all', 'All', items.length],
            ['unread', 'Unread', unread],
            ['read', 'Read', read],
          ].map(([value, label, count]) => (
            <button
              key={value}
              className={filter === value ? 'adm-segment-active' : ''}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}<span>{count}</span>
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <div className="adm-message-list">
          {filtered.map(message => {
            const isExpanded = expanded === message.id;
            const phone = String(message.whatsapp || '').replace(/\D/g, '');
            return (
              <article className={`adm-message-card${!message.read ? ' adm-message-unread' : ''}${isExpanded ? ' adm-message-open' : ''}`} key={message.id}>
                <button className="adm-message-summary" onClick={() => openMessage(message)} aria-expanded={isExpanded}>
                  <span className="adm-avatar">{initials(message.name)}</span>
                  <span className="adm-message-main">
                    <span className="adm-message-title"><strong>{message.name || 'Anonymous'}</strong>{!message.read && <span className="adm-unread-pill">New</span>}</span>
                    <span className="adm-message-preview">{message.message}</span>
                  </span>
                  <span className="adm-message-date">{timeAgo(message.createdAt)}</span>
                  {!message.read && <span className="adm-unread-dot" />}
                  <span className={`adm-chevron${isExpanded ? ' adm-chevron-open' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="adm-message-details">
                    <div className="adm-contact-links">
                      {message.email && <a href={`mailto:${message.email}`}>{message.email}</a>}
                      {phone && <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">WhatsApp · {message.whatsapp}</a>}
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="adm-message-body">{message.message}</p>
                    <div className="adm-inline-actions">
                      {message.email && <a className="adm-button adm-button-secondary" href={`mailto:${message.email}`}>Reply <Icon name="arrow" size={16} /></a>}
                      {phone && <a className="adm-button adm-button-secondary" href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                      <button className="adm-button adm-button-secondary" onClick={() => toggleRead(message)}>
                        <Icon name="check" size={16} /> Mark {message.read ? 'unread' : 'read'}
                      </button>
                      <button
                        className="adm-button adm-button-danger"
                        onClick={() => requestConfirm({
                          title: 'Delete this message?',
                          message: `This will permanently remove the message from ${message.name || 'this sender'}.`,
                          confirmLabel: 'Delete message',
                          onConfirm: () => remove(message),
                        })}
                      >
                        <Icon name="trash" size={16} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="adm-empty-state">
          <span className="adm-empty-icon"><Icon name="messages" size={24} /></span>
          <h2>{items.length ? 'No matching messages' : 'Your inbox is quiet'}</h2>
          <p>{items.length ? 'Try another search or filter.' : 'New notes from your contact form will show up here.'}</p>
        </div>
      )}
    </div>
  );
}

function useDialogKeyboard(dialogRef, onClose, active = true) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!active) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previousFocus = document.activeElement;
    const getFocusable = () => [...dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter(element => element.getClientRects().length > 0);
    const focusable = getFocusable();
    (focusable[0] || dialog).focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const current = getFocusable();
      if (!current.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = current[0];
      const last = current[current.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [active, dialogRef]);
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  try {
    let width = Math.min(bitmap.width, 1400);
    let height = Math.round(bitmap.height * (width / bitmap.width));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image.');

    for (let sizePass = 0; sizePass < 12; sizePass += 1) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      for (const type of ['image/webp', 'image/jpeg']) {
        for (const quality of [0.82, 0.68, 0.54, 0.4]) {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, type, quality));
          if (blob?.type === type && blob.size <= 1.4 * 1024 * 1024) return blob;
        }
      }
      width = Math.round(width * 0.78);
      height = Math.round(height * 0.78);
    }
    throw new Error('This image could not be compressed under 1.4 MB.');
  } finally {
    bitmap.close();
  }
}

function ProjectDrawer({ project, onClose, onSaved, notify }) {
  const [form, setForm] = useState(project);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  useDialogKeyboard(dialogRef, onClose);
  const set = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const tagList = form.tags.split(',').map(tag => tag.trim()).filter(Boolean);

  async function upload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to upload.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const blob = await compressImage(file);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob,
      });
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok) {
        throw new Error(data.error ? `${data.error}${data.detail ? ` ${data.detail}` : ''}` : `Upload failed (${response.status}).`);
      }
      if (!data.url) throw new Error('The server did not return an image URL.');
      setForm(current => ({ ...current, image: data.url }));
      notify('Cover image uploaded.', 'success');
    } catch (uploadError) {
      setError(uploadError.message);
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
      if (form.id) {
        await api(`/api/admin/projects/${encodeURIComponent(form.id)}`, { method: 'PUT', body });
      } else {
        await api('/api/admin/projects', { method: 'POST', body });
      }
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <aside
        ref={dialogRef}
        className="adm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-project-form-title"
        tabIndex={-1}
      >
        <header className="adm-drawer-header">
          <div><p className="adm-eyebrow">{form.id ? 'REFINE YOUR SHOWCASE' : 'ADD TO YOUR SHOWCASE'}</p><h2 id="adm-project-form-title">{form.id ? 'Edit project' : 'New project'}</h2></div>
          <button className="adm-icon-button" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        </header>
        <form id="adm-project-form" className="adm-project-form" onSubmit={submit}>
          <label className="adm-field">
            <span>Project name</span>
            <input value={form.name} onChange={set('name')} maxLength={80} required placeholder="A name people will remember" />
          </label>
          <fieldset className="adm-category-control">
            <legend>Category</legend>
            <div className="adm-segment">
              {CATEGORIES.map(([category, label]) => (
                <button
                  type="button"
                  key={category}
                  className={form.category === category ? 'adm-segment-active' : ''}
                  onClick={() => setForm(current => ({ ...current, category }))}
                  aria-pressed={form.category === category}
                >{label}</button>
              ))}
            </div>
          </fieldset>
          <label className="adm-field">
            <span className="adm-label-row">Description <span>{form.description.length}/400</span></span>
            <textarea value={form.description} onChange={set('description')} maxLength={400} rows={4} required placeholder="What does it do, and what makes it special?" />
          </label>
          <label className="adm-field">
            <span>Tags <span className="adm-label-hint">Separate with commas</span></span>
            <input value={form.tags} onChange={set('tags')} placeholder="React, Next.js, Design" />
          </label>
          {tagList.length > 0 && <div className="adm-tag-preview" aria-label="Tag preview">{tagList.map((tag, index) => <span className="adm-project-tag" key={`${tag}-${index}`}>{tag}</span>)}</div>}
          <div className="adm-form-two-col">
            <label className="adm-field"><span>Live link</span><input type="url" value={form.url} onChange={set('url')} placeholder="https://…" /></label>
            <label className="adm-field"><span>GitHub link</span><input type="url" value={form.repo} onChange={set('repo')} placeholder="https://github.com/…" /></label>
          </div>
          <div className="adm-field">
            <span>Cover image</span>
            <input
              ref={inputRef}
              className="adm-hidden-input"
              type="file"
              accept="image/*"
              onChange={event => { upload(event.target.files?.[0]); event.target.value = ''; }}
            />
            {form.image ? (
              <div className="adm-image-preview">
                <img src={form.image} alt="Project cover preview" />
                <div className="adm-image-preview-actions">
                  <button type="button" className="adm-button adm-button-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>Change image</button>
                  <button type="button" className="adm-text-button adm-remove-image" onClick={() => setForm(current => ({ ...current, image: '' }))}>Remove image</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="adm-dropzone"
                onClick={() => inputRef.current?.click()}
                onDragOver={event => event.preventDefault()}
                onDrop={event => { event.preventDefault(); upload(event.dataTransfer.files?.[0]); }}
                disabled={uploading}
              >
                <span className="adm-upload-icon"><Icon name="upload" size={22} /></span>
                <strong>{uploading ? 'Preparing and uploading…' : 'Drop an image here or browse'}</strong>
                <span>Compressed to WebP or JPEG · max 1.4 MB</span>
              </button>
            )}
          </div>
          {error && <p className="adm-form-error" role="alert">{error}</p>}
        </form>
        <footer className="adm-drawer-footer">
          <button type="button" className="adm-button adm-button-secondary" onClick={onClose}>Cancel</button>
          <button form="adm-project-form" className="adm-button adm-button-primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : form.id ? 'Save changes' : 'Add project'}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Projects({ notify, requestConfirm }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api('/api/admin/projects');
      setItems(Array.isArray(data.projects) ? data.projects : []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(project) {
    try {
      await api(`/api/admin/projects/${encodeURIComponent(project.id)}`, { method: 'DELETE' });
      setItems(current => current.filter(item => item.id !== project.id));
      notify('Project deleted.', 'success');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  }

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!items) return <Skeleton cards={4} />;

  const counts = Object.fromEntries([
    ['all', items.length],
    ...CATEGORIES.map(([category]) => [category, items.filter(item => item.category === category).length]),
  ]);
  const visible = filter === 'all' ? items : items.filter(project => project.category === filter);

  return (
    <div className="adm-view-content">
      <div className="adm-page-heading">
        <div><p className="adm-eyebrow">THE WORK YOU PUT INTO THE WORLD</p><h1>Projects</h1><p className="adm-muted">Your portfolio, shaped by the things you make.</p></div>
        <button className="adm-button adm-button-primary" onClick={() => setEditing({ ...EMPTY_PROJECT })}><Icon name="plus" size={18} /> Add project</button>
      </div>
      <div className="adm-project-filters">
        {[['all', 'All projects'], ...CATEGORIES].map(([value, label]) => (
          <button key={value} className={filter === value ? 'adm-filter-active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>
            {label}<span>{counts[value] || 0}</span>
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="adm-project-grid">
          {visible.map(project => (
            <article className="adm-project-card" key={project.id}>
              <div className="adm-project-cover">
                {project.image ? <img src={project.image} alt="" /> : <span>{initials(project.name)}</span>}
                <span className={`adm-project-category adm-category-${project.category}`}>{CATEGORIES.find(([key]) => key === project.category)?.[1] || project.category}</span>
              </div>
              <div className="adm-project-content">
                <div className="adm-project-title-row">
                  <h2>{project.name}</h2>
                  <div className="adm-project-links">
                    {project.url && <a className="adm-project-link" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Open live link for ${project.name}`} title="Live link"><Icon name="external" size={17} /></a>}
                    {project.repo && <a className="adm-project-link" href={project.repo} target="_blank" rel="noopener noreferrer" aria-label={`Open GitHub repository for ${project.name}`} title="GitHub link"><Icon name="external" size={17} /></a>}
                  </div>
                </div>
                <p className="adm-project-description">{project.description}</p>
                <div className="adm-project-tags">
                  {(project.tags || []).slice(0, 4).map((tag, index) => <span className="adm-project-tag" key={`${tag}-${index}`}>{tag}</span>)}
                  {(project.tags || []).length > 4 && <span className="adm-project-tag">+{project.tags.length - 4}</span>}
                </div>
                <div className="adm-project-actions">
                  <button className="adm-button adm-button-secondary" onClick={() => setEditing({ ...EMPTY_PROJECT, ...project, tags: (project.tags || []).join(', ') })}><Icon name="edit" size={16} /> Edit</button>
                  <button className="adm-icon-button adm-danger-icon" aria-label={`Delete ${project.name}`} onClick={() => requestConfirm({
                    title: 'Delete this project?',
                    message: `"${project.name}" will be removed from your portfolio.`,
                    confirmLabel: 'Delete project',
                    onConfirm: () => remove(project),
                  })}><Icon name="trash" size={17} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="adm-empty-state">
          <span className="adm-empty-icon"><Icon name="projects" size={24} /></span>
          <h2>{items.length ? 'No projects in this category' : 'Your next project starts here'}</h2>
          <p>{items.length ? 'Try another category filter.' : 'Add a project to give your portfolio a fresh update.'}</p>
          {!items.length && <button className="adm-button adm-button-primary" onClick={() => setEditing({ ...EMPTY_PROJECT })}><Icon name="plus" size={18} /> Add your first project</button>}
        </div>
      )}
      {editing && <ProjectDrawer project={editing} onClose={() => setEditing(null)} notify={notify} onSaved={() => {
        setEditing(null);
        notify(editing.id ? 'Project updated.' : 'Project added.', 'success');
        load();
      }} />}
    </div>
  );
}

function ConfirmModal({ confirmation, onClose }) {
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef(null);
  useDialogKeyboard(dialogRef, onClose, Boolean(confirmation));
  if (!confirmation) return null;
  async function confirm() {
    setBusy(true);
    try {
      await confirmation.onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="adm-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        ref={dialogRef}
        className="adm-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="adm-confirm-title"
        tabIndex={-1}
      >
        <span className="adm-confirm-icon"><Icon name="trash" size={21} /></span>
        <h2 id="adm-confirm-title">{confirmation.title}</h2>
        <p>{confirmation.message}</p>
        <div className="adm-modal-actions">
          <button className="adm-button adm-button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="adm-button adm-button-danger" onClick={confirm} disabled={busy}>{busy ? 'Working…' : confirmation.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className={`adm-toast adm-toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <Icon name={toast.type === 'error' ? 'close' : 'check'} size={18} />
      <span>{toast.message}</span>
      <button className="adm-toast-close" onClick={onDismiss} aria-label="Dismiss notification"><Icon name="close" size={16} /></button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="adm-loading-screen" role="status" aria-label="Checking admin session">
      <span className="adm-loading-orbit"><img src="/favicon.svg" alt="" /></span>
      <p>Opening your workspace…</p>
    </main>
  );
}

export default function AdminApp() {
  const [auth, setAuth] = useState({ status: 'loading', authed: false, configured: false, dbReady: false, error: '' });
  const [tab, setTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const toastTimer = useRef(null);

  const checkSession = useCallback(async () => {
    setAuth(current => ({ ...current, status: 'loading', error: '' }));
    try {
      const data = await api('/api/admin/me');
      setAuth({
        status: 'ready',
        authed: Boolean(data.authed),
        configured: Boolean(data.configured),
        dbReady: Boolean(data.dbReady),
        error: '',
      });
    } catch (error) {
      setAuth({
        status: 'error',
        authed: false,
        configured: null,
        dbReady: null,
        error: error.message,
      });
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('adm-theme');
      if (saved === 'light' || saved === 'dark') setTheme(saved);
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
    } catch {
      setTheme('light');
    }
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem('adm-theme', theme); } catch { /* Storage may be disabled. */ }
  }, [theme]);
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (TABS.includes(fromHash)) setTab(fromHash);
    const onHashChange = () => {
      const value = window.location.hash.slice(1);
      if (TABS.includes(value)) setTab(value);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function navigate(nextTab) {
    setTab(nextTab);
    if (window.location.hash !== `#${nextTab}`) window.history.replaceState(null, '', `#${nextTab}`);
  }
  const notify = useCallback((message, type = 'success', duration = 3600) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), duration);
  }, []);
  function requestConfirm(request) { setConfirmation(request); }
  const refreshUnread = useCallback(async () => {
    try {
      const data = await api('/api/admin/stats');
      setUnreadCount(Number(data.messages?.unread || 0));
    } catch (error) {
      notify(error.message, 'error');
    }
  }, [notify]);
  useEffect(() => {
    if (auth.authed) refreshUnread();
  }, [auth.authed, refreshUnread]);

  async function logout() {
    try {
      await api('/api/admin/login', { method: 'DELETE' });
      setAuth(current => ({ ...current, authed: false }));
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function completeLogin() {
    setTab('dashboard');
    setAuth(current => ({ ...current, authed: true }));
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  if (auth.status === 'loading') return <LoadingScreen />;
  if (!auth.authed) {
    return (
      <Login
        configured={auth.configured}
        dbReady={auth.dbReady}
        serverError={auth.status === 'error' ? auth.error : ''}
        theme={theme}
        onToggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}
        onDone={completeLogin}
        onRetry={checkSession}
      />
    );
  }

  return (
    <main className={`adm-workspace adm-theme-${theme}`}>
      <aside className="adm-sidebar">
        <a className="adm-sidebar-brand" href="/" aria-label="adnanzeros home">
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span>adnanzeros<small>STUDIO</small></span>
        </a>
        <p className="adm-nav-label">WORKSPACE</p>
        <nav className="adm-main-nav" aria-label="Admin sections">
          {[
            ['dashboard', 'Dashboard'],
            ['messages', 'Messages'],
            ['projects', 'Projects'],
          ].map(([value, label]) => (
            <button key={value} className={`adm-nav-item${tab === value ? ' adm-nav-active' : ''}`} onClick={() => navigate(value)}>
              <Icon name={value} size={19} /><span>{label}</span>
              {value === 'messages' && <UnreadBadge count={unreadCount} />}
            </button>
          ))}
        </nav>
        <p className="adm-nav-label adm-nav-label-later">IN THE WORKS</p>
        <div className="adm-main-nav">
          {[['blog', 'Blog'], ['products', 'Products'], ['payments', 'Payments']].map(([icon, label]) => (
            <span className="adm-nav-item adm-nav-disabled" key={label} aria-disabled="true">
              <Icon name={icon} size={19} /><span>{label}</span><small>SOON</small>
            </span>
          ))}
        </div>
        <div className="adm-sidebar-bottom">
          <a className="adm-nav-item" href="/" target="_blank" rel="noopener noreferrer"><Icon name="external" size={19} /><span>View site</span></a>
          <button className="adm-nav-item" onClick={logout}><Icon name="logout" size={19} /><span>Log out</span></button>
          <div className="adm-sidebar-profile"><span className="adm-avatar">AZ</span><span><strong>Adnan Sami</strong><small>Portfolio owner</small></span><ThemeToggle theme={theme} onToggle={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} /></div>
        </div>
      </aside>

      <section className="adm-main-area">
        <header className="adm-topbar">
          <div className="adm-mobile-brand"><img src="/favicon.svg" alt="" width="30" height="30" /><strong>adnanzeros</strong></div>
          <div className="adm-breadcrumb"><span>Workspace</span><span>/</span><strong>{tab[0].toUpperCase() + tab.slice(1)}</strong></div>
          <div className="adm-topbar-actions">
            <ThemeToggle theme={theme} onToggle={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} />
            <a className="adm-icon-button" href="/" target="_blank" rel="noopener noreferrer" aria-label="View site"><Icon name="external" size={19} /></a>
            <button className="adm-icon-button adm-mobile-logout" onClick={logout} aria-label="Log out"><Icon name="logout" size={19} /></button>
          </div>
        </header>
        <div className="adm-content-area">
          {tab === 'dashboard' && (
            <Dashboard onOpenMessages={id => { setSelectedMessage(id || null); navigate('messages'); }} />
          )}
          {tab === 'messages' && <Messages key={selectedMessage || 'messages'} selectedId={selectedMessage} notify={notify} requestConfirm={requestConfirm} onUnreadChanged={refreshUnread} />}
          {tab === 'projects' && <Projects notify={notify} requestConfirm={requestConfirm} />}
        </div>
        <nav className="adm-mobile-tabs" aria-label="Admin sections">
          {TABS.map(value => (
            <button key={value} className={tab === value ? 'adm-mobile-tab-active' : ''} onClick={() => navigate(value)}>
              <span className="adm-mobile-tab-icon"><Icon name={value} size={20} />{value === 'messages' && <UnreadBadge count={unreadCount} compact />}</span>
              <span>{value[0].toUpperCase() + value.slice(1)}</span>
            </button>
          ))}
        </nav>
      </section>
      <ConfirmModal confirmation={confirmation} onClose={() => setConfirmation(null)} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}

function UnreadBadge({ count, compact = false }) {
  if (!count) return null;
  return <span className={compact ? 'adm-mobile-unread-badge' : 'adm-unread-badge'}>{count > 99 ? '99+' : count}</span>;
}
