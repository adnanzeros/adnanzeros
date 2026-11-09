'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DATE_FILTERS,
  categoriesFromPosts,
  formatDate,
  matchesDateFilter,
} from '../../lib/blog-utils';
import './blog-admin.css';
// NOTUN: visual bilingual builder + category delete
import BlogBuilder from './blog-builder/BlogBuilder';
import { CategoryManager } from './blog-builder/CategoryBox';

/* Blog admin: list + editor. AdminApp theke `kit` prop e Icon/api/compressImage ashe */

const esc = value =>
  String(value).replace(
    /[&<>"']/g,
    c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );

const TEXT_COLORS = [
  '#1d2740',
  '#c0392b',
  '#d35400',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#7f8c8d',
  '#ffffff',
];
const HIGHLIGHTS = [
  '#fff3a3',
  '#c8f7c5',
  '#ffd6e0',
  '#cfe5ff',
  '#ffe0b3',
  '#e5d4ff',
];

async function uploadImage(kit, file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Choose an image file to upload.');
  }
  const blob = await kit.compressImage(file);
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': blob.type },
    body: blob,
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok || !data.url) {
    throw new Error(data.error || `Upload failed (${response.status}).`);
  }
  return data.url;
}

/* ---------------- Rich text editor ---------------- */
function RichEditor({ editorRef, initialHtml, kit, notify }) {
  const saved = useRef(null);
  const [menu, setMenu] = useState(null);
  const [imgOpen, setImgOpen] = useState(false);
  const [img, setImg] = useState({
    url: '',
    title: '',
    place: '',
    time: '',
    busy: false,
  });
  const [fig, setFig] = useState(null);

  useEffect(() => {
    const el = editorRef.current;
    el.innerHTML = initialHtml || '<p><br></p>';
    el.querySelectorAll('figure').forEach(f =>
      f.setAttribute('contenteditable', 'false'),
    );
  }, [editorRef, initialHtml]);

  useEffect(() => {
    function remember() {
      const sel = document.getSelection();
      if (sel?.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
        saved.current = sel.getRangeAt(0).cloneRange();
      }
    }
    document.addEventListener('selectionchange', remember);
    return () => document.removeEventListener('selectionchange', remember);
  }, [editorRef]);

  function restore() {
    editorRef.current.focus();
    if (saved.current) {
      const sel = document.getSelection();
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  }
  function run(command, value) {
    restore();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, value);
    setMenu(null);
  }
  function addLink() {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim()))
      run('createLink', url.trim());
    else if (url)
      notify('Link must start with http://, https:// or mailto:', 'error');
  }

  async function pick(file) {
    setImg(c => ({ ...c, busy: true }));
    try {
      const url = await uploadImage(kit, file);
      setImg(c => ({ ...c, url, busy: false }));
    } catch (error) {
      notify(error.message, 'error');
      setImg(c => ({ ...c, busy: false }));
    }
  }
  function insertImage() {
    if (!img.url) return;
    const meta = [img.place, img.time]
      .map(v => v.trim())
      .filter(Boolean)
      .map(esc)
      .join(' · ');
    const title = img.title.trim();
    const caption =
      title || meta
        ? `<figcaption>${title ? `<strong class="cap-title">${esc(title)}</strong>` : ''}${meta ? `<span class="cap-meta">${meta}</span>` : ''}</figcaption>`
        : '';
    run(
      'insertHTML',
      `<figure contenteditable="false"><img src="${esc(img.url)}" alt="${esc(title)}">${caption}</figure><p><br></p>`,
    );
    setImg({ url: '', title: '', place: '', time: '', busy: false });
    setImgOpen(false);
  }

  function onEditorClick(event) {
    const root = editorRef.current;
    root
      .querySelectorAll('figure.is-selected')
      .forEach(f => f.classList.remove('is-selected'));
    const target = event.target.closest?.('figure');
    if (target && root.contains(target)) {
      target.classList.add('is-selected');
      setFig(target);
    } else {
      setFig(null);
    }
  }

  const Btn = ({ label, title, onClick, active }) => (
    <button
      type="button"
      className={active ? 'blg-tb-active' : ''}
      title={title}
      aria-label={title}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="blg-editor">
      <div className="blg-toolbar" role="toolbar" aria-label="Formatting">
        <Btn label={<b>B</b>} title="Bold" onClick={() => run('bold')} />
        <Btn label={<i>I</i>} title="Italic" onClick={() => run('italic')} />
        <Btn
          label={<u>U</u>}
          title="Underline"
          onClick={() => run('underline')}
        />
        <Btn
          label={<s>S</s>}
          title="Strikethrough"
          onClick={() => run('strikeThrough')}
        />
        <span className="blg-sep" />
        <Btn
          label="H2"
          title="Heading"
          onClick={() => run('formatBlock', 'h2')}
        />
        <Btn
          label="H3"
          title="Sub heading"
          onClick={() => run('formatBlock', 'h3')}
        />
        <Btn
          label="P"
          title="Normal text"
          onClick={() => run('formatBlock', 'p')}
        />
        <Btn
          label="❝"
          title="Quote"
          onClick={() => run('formatBlock', 'blockquote')}
        />
        <span className="blg-sep" />
        <Btn
          label="•"
          title="Bullet list"
          onClick={() => run('insertUnorderedList')}
        />
        <Btn
          label="1."
          title="Numbered list"
          onClick={() => run('insertOrderedList')}
        />
        <Btn label="⇤" title="Align left" onClick={() => run('justifyLeft')} />
        <Btn
          label="↔"
          title="Align center"
          onClick={() => run('justifyCenter')}
        />
        <Btn
          label="⇥"
          title="Align right"
          onClick={() => run('justifyRight')}
        />
        <span className="blg-sep" />
        <div className="blg-pop-wrap">
          <Btn
            label={<span className="blg-a">A</span>}
            title="Text color"
            onClick={() => setMenu(m => (m === 'color' ? null : 'color'))}
            active={menu === 'color'}
          />
          {menu === 'color' && (
            <div className="blg-pop">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className="blg-swatch"
                  style={{ background: c }}
                  aria-label={`Text color ${c}`}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => run('foreColor', c)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="blg-pop-wrap">
          <Btn
            label={<span className="blg-hl">H</span>}
            title="Highlight"
            onClick={() => setMenu(m => (m === 'hl' ? null : 'hl'))}
            active={menu === 'hl'}
          />
          {menu === 'hl' && (
            <div className="blg-pop">
              {HIGHLIGHTS.map(c => (
                <button
                  key={c}
                  type="button"
                  className="blg-swatch"
                  style={{ background: c }}
                  aria-label={`Highlight ${c}`}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => run('hiliteColor', c)}
                />
              ))}
              <button
                type="button"
                className="blg-swatch blg-swatch-none"
                aria-label="Remove highlight"
                onMouseDown={e => e.preventDefault()}
                onClick={() => run('hiliteColor', 'transparent')}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <Btn label="🔗" title="Add link" onClick={addLink} />
        <Btn
          label="⌫"
          title="Clear formatting"
          onClick={() => run('removeFormat')}
        />
        <span className="blg-sep" />
        <Btn
          label="🖼 Image"
          title="Insert image"
          onClick={() => {
            restore();
            setImgOpen(o => !o);
          }}
          active={imgOpen}
        />
        {fig && (
          <Btn
            label="Remove image"
            title="Remove selected image"
            onClick={() => {
              fig.remove();
              setFig(null);
            }}
          />
        )}
        <span className="blg-sep" />
        <Btn label="↶" title="Undo" onClick={() => run('undo')} />
        <Btn label="↷" title="Redo" onClick={() => run('redo')} />
      </div>

      {imgOpen && (
        <div className="blg-imgbox">
          <label className="blg-filebtn">
            {img.busy
              ? 'Uploading…'
              : img.url
                ? 'Change image'
                : 'Choose image'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={img.busy}
              onChange={e => {
                pick(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {img.url && <img className="blg-imgprev" src={img.url} alt="" />}
          <div className="blg-imgfields">
            <input
              placeholder="Image title"
              value={img.title}
              onChange={e => setImg(c => ({ ...c, title: e.target.value }))}
            />
            <input
              placeholder="Place (e.g. Dhaka)"
              value={img.place}
              onChange={e => setImg(c => ({ ...c, place: e.target.value }))}
            />
            <input
              placeholder="Time (e.g. 8 Nov 2026, 5:30 PM)"
              value={img.time}
              onChange={e => setImg(c => ({ ...c, time: e.target.value }))}
            />
          </div>
          <div className="blg-imgactions">
            <button
              type="button"
              className="adm-button adm-button-primary"
              disabled={!img.url || img.busy}
              onClick={insertImage}
            >
              Insert into post
            </button>
            <button
              type="button"
              className="adm-button adm-button-secondary"
              onClick={() => setImgOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        className="blg-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Post content"
        data-placeholder="Start writing your post…"
        onClick={onEditorClick}
        onPaste={e => {
          e.preventDefault();
          document.execCommand(
            'insertText',
            false,
            e.clipboardData.getData('text/plain'),
          );
        }}
      />
    </div>
  );
}

/* ---------------- Category picker ----------------
   Input e type korle sheta-i post er category (notun hole save e banbe).
   Niche ager category gulo chip hishebe ache, click korle select hoy. */
function CategoryPicker({ value, onChange, kit, notify }) {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    kit
      .api('/api/admin/blog/categories')
      .then(data => {
        if (!cancelled) setList(data.categories || []);
      })
      .catch(e => notify(e.message, 'error'));
    return () => {
      cancelled = true;
    };
  }, [kit, notify]);

  const typed = value.trim();
  const lowered = typed.toLowerCase();
  const exact = list.find(c => c.name.toLowerCase() === lowered);
  const chips =
    typed && !exact
      ? list.filter(c => c.name.toLowerCase().includes(lowered))
      : list;

  async function createNow() {
    setBusy(true);
    try {
      const data = await kit.api('/api/admin/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name: typed }),
      });
      setList(data.categories || []);
      onChange(data.name);
      notify(`Category "${data.name}" is ready.`, 'success');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(category) {
    try {
      const data = await kit.api(
        `/api/admin/blog/categories/${encodeURIComponent(category.name)}`,
        { method: 'DELETE' },
      );
      setList(data.categories || []);
      notify(`Category "${category.name}" removed.`, 'success');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  return (
    <div className="blg-cat">
      <input
        className="blg-search"
        value={value}
        onChange={event => onChange(event.target.value)}
        maxLength={30}
        placeholder="Type a category, e.g. web"
        aria-label="Category"
      />
      {typed && !exact ? (
        <div className="blg-cat-new">
          <p className="adm-muted blg-hint">
            New category &quot;{typed}&quot; will be created when you save.
          </p>
          <button
            type="button"
            className="adm-button adm-button-secondary"
            onClick={createNow}
            disabled={busy}
          >
            {busy ? 'Creating…' : 'Create now'}
          </button>
        </div>
      ) : (
        <p className="adm-muted blg-hint">
          {typed
            ? 'Existing category selected.'
            : 'Leave empty to use "General".'}
        </p>
      )}
      {chips.length > 0 && (
        <div className="blg-cat-chips">
          {chips.map(category => (
            <span
              key={category.name}
              className={`blg-cat-chip${
                exact?.name === category.name ? ' blg-cat-chip-active' : ''
              }`}
            >
              <button type="button" onClick={() => onChange(category.name)}>
                {category.name}
                <small>{category.count}</small>
              </button>
              {category.count === 0 &&
                category.name.toLowerCase() !== 'general' &&
                exact?.name !== category.name && (
                  <button
                    type="button"
                    className="blg-cat-x"
                    aria-label={`Remove ${category.name}`}
                    onClick={() => removeCategory(category)}
                  >
                    ×
                  </button>
                )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Editor screen ---------------- */
function BlogEditor({ id, onClose, onSaved, notify, kit }) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    category: '',
    status: 'draft',
  });
  const [html, setHtml] = useState(id ? null : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef(null);
  const live = form.status === 'published';

  useEffect(() => {
    if (!id) return;
    kit
      .api(`/api/admin/blog/${encodeURIComponent(id)}`)
      .then(({ post }) => {
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          coverImage: post.coverImage || '',
          category: post.category || 'General',
          status: post.status,
        });
        setHtml(post.contentHtml || '');
      })
      .catch(e => setError(e.message));
  }, [id, kit]);

  const set = key => event =>
    setForm(c => ({ ...c, [key]: event.target.value }));

  async function uploadCover(file) {
    setUploading(true);
    try {
      const url = await uploadImage(kit, file);
      setForm(c => ({ ...c, coverImage: url }));
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function save(status) {
    const el = editorRef.current;
    if (!form.title.trim()) return notify('Title is required.', 'error');
    if (!el.textContent.trim() && !el.querySelector('img'))
      return notify('Write some content first.', 'error');
    const clone = el.cloneNode(true);
    clone
      .querySelectorAll('[contenteditable]')
      .forEach(n => n.removeAttribute('contenteditable'));
    clone
      .querySelectorAll('.is-selected')
      .forEach(n => n.classList.remove('is-selected'));
    setBusy(true);
    try {
      await kit.api(
        id ? `/api/admin/blog/${encodeURIComponent(id)}` : '/api/admin/blog',
        {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...form,
            status,
            contentHtml: clone.innerHTML,
          }),
        },
      );
      notify(
        status === 'published' ? 'Post published.' : 'Draft saved.',
        'success',
      );
      onSaved();
    } catch (e) {
      notify(e.message, 'error');
      setBusy(false);
    }
  }

  if (error) return <kit.ErrorBox error={error} onRetry={onClose} />;
  if (html === null) return <kit.Skeleton cards={2} />;

  return (
    <div className="adm-view-content">
      <div className="adm-page-heading">
        <div>
          <button className="adm-text-button" onClick={onClose}>
            ← Back to posts
          </button>
          <h1>{id ? 'Edit post' : 'New post'}</h1>
        </div>
        <div className="blg-save-row">
          <button
            className="adm-button adm-button-secondary"
            disabled={busy || uploading}
            onClick={() => save('draft')}
          >
            {live ? 'Unpublish' : 'Save draft'}
          </button>
          <button
            className="adm-button adm-button-primary"
            disabled={busy || uploading}
            onClick={() => save('published')}
          >
            {busy ? 'Saving…' : live ? 'Update post' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="blg-layout">
        <div className="blg-main">
          <section className="blg-panel">
            <label className="adm-field">
              Title
              <input
                value={form.title}
                onChange={set('title')}
                maxLength={150}
                placeholder="Post title"
              />
            </label>
            <label className="adm-field">
              Short excerpt{' '}
              <span className="adm-muted">(optional, shown on cards)</span>
              <textarea
                value={form.excerpt}
                onChange={set('excerpt')}
                maxLength={300}
                rows={3}
                placeholder="One or two lines about this post"
              />
            </label>
          </section>
          <section className="blg-panel">
            <p className="adm-eyebrow">CONTENT</p>
            <RichEditor
              editorRef={editorRef}
              initialHtml={html}
              kit={kit}
              notify={notify}
            />
          </section>
        </div>

        <aside className="blg-side">
          <section className="blg-panel">
            <p className="adm-eyebrow">CATEGORY</p>
            <CategoryPicker
              value={form.category}
              onChange={name => setForm(c => ({ ...c, category: name }))}
              kit={kit}
              notify={notify}
            />
            <p className="adm-muted blg-hint">
              This post will appear under this category on the blog page.
            </p>
          </section>
          <section className="blg-panel">
            <p className="adm-eyebrow">COVER IMAGE</p>
            {form.coverImage ? (
              <img className="blg-cover-prev" src={form.coverImage} alt="" />
            ) : (
              <div className="blg-cover-empty">No cover yet</div>
            )}
            <div className="blg-cover-actions">
              <label className="adm-button adm-button-secondary blg-filelabel">
                {uploading
                  ? 'Uploading…'
                  : form.coverImage
                    ? 'Change'
                    : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={e => {
                    uploadCover(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {form.coverImage && (
                <button
                  className="adm-button adm-button-danger"
                  onClick={() => setForm(c => ({ ...c, coverImage: '' }))}
                >
                  Remove
                </button>
              )}
            </div>
          </section>
          <section className="blg-panel">
            <p className="adm-eyebrow">LINK</p>
            <label className="adm-field">
              Slug <span className="adm-muted">(auto from title if empty)</span>
              <input
                value={form.slug}
                onChange={set('slug')}
                placeholder="my-first-post"
              />
            </label>
            <p className="adm-muted blg-hint">
              Status: <strong>{live ? 'Published' : 'Draft'}</strong>. The
              publish date is set automatically the first time you publish.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- List screen ---------------- */
export default function BlogAdmin({ notify, requestConfirm, kit }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [range, setRange] = useState('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setPosts((await kit.api('/api/admin/blog')).posts);
    } catch (e) {
      setError(e.message);
    }
  }, [kit]);
  useEffect(() => {
    load();
  }, [load]);

  const dateOf = p => p.publishedAt || p.createdAt;
  const visible = useMemo(
    () =>
      (posts || []).filter(
        p =>
          (status === 'all' || p.status === status) &&
          (category === 'all' || p.category === category) &&
          matchesDateFilter(dateOf(p), range) &&
          p.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [posts, status, category, range, query],
  );
  const categoryOptions = useMemo(() => categoriesFromPosts(posts), [posts]);

  async function remove(post) {
    try {
      await kit.api(`/api/admin/blog/${encodeURIComponent(post.id)}`, {
        method: 'DELETE',
      });
      setPosts(c => c.filter(p => p.id !== post.id));
      notify('Post deleted.', 'success');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  if (editing) {
    return (
      <BlogBuilder
        id={editing === 'new' ? null : editing}
        kit={kit}
        notify={notify}
        requestConfirm={requestConfirm}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setPosts(null);
          load();
        }}
      />
    );
  }
  if (error) return <kit.ErrorBox error={error} onRetry={load} />;
  if (!posts) return <kit.Skeleton cards={4} />;

  const statusCount = key =>
    posts.filter(p => key === 'all' || p.status === key).length;

  return (
    <div className="adm-view-content">
      <div className="adm-page-heading">
        <div>
          <p className="adm-eyebrow">STORIES &amp; NOTES</p>
          <h1>Blog</h1>
          <p className="adm-muted">Write, publish and organize your posts.</p>
        </div>
        <button
          className="adm-button adm-button-primary"
          onClick={() => setEditing('new')}
        >
          <kit.Icon name="plus" size={18} /> New post
        </button>
      </div>

      <CategoryManager
        kit={kit}
        notify={notify}
        requestConfirm={requestConfirm}
        onChanged={load}
      />

      <div className="blg-filters">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <input
            className="blg-search"
            type="search"
            placeholder="Search title…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            className="blg-search"
            value={status}
            onChange={e => setStatus(e.target.value)}
            aria-label="Status"
          >
            <option value="all">All status ({statusCount('all')})</option>
            <option value="published">
              Published ({statusCount('published')})
            </option>
            <option value="draft">Drafts ({statusCount('draft')})</option>
          </select>
          <select
            className="blg-search"
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Category"
          >
            <option value="all">All categories</option>
            {categoryOptions.map(({ name, count }) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
          <select
            className="blg-search"
            value={range}
            onChange={e => setRange(e.target.value)}
            aria-label="Sort by date"
          >
            {DATE_FILTERS.map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length ? (
        <div className="blg-list">
          {visible.map(post => (
            <article className="blg-row" key={post.id}>
              <div className="blg-thumb">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" />
                ) : (
                  <span>{post.title.slice(0, 1)}</span>
                )}
              </div>
              <div className="blg-info">
                <h2>{post.title}</h2>
                <p className="adm-muted">
                  <span className={`blg-badge blg-badge-${post.status}`}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span
                    className="blg-badge"
                    style={{
                      background: 'var(--adm-lavender)',
                      color: 'var(--adm-text)',
                    }}
                  >
                    {post.category}
                  </span>
                  {formatDate(dateOf(post))} · {post.readingMinutes} min read
                </p>
              </div>
              <div className="blg-actions">
                {post.status === 'published' && (
                  <a
                    className="adm-icon-button"
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View post"
                  >
                    <kit.Icon name="external" size={16} />
                  </a>
                )}
                <button
                  className="adm-icon-button"
                  aria-label="Edit post"
                  onClick={() => setEditing(post.id)}
                >
                  <kit.Icon name="edit" size={16} />
                </button>
                <button
                  className="adm-icon-button"
                  aria-label="Delete post"
                  onClick={() =>
                    requestConfirm({
                      title: 'Delete this post?',
                      message: `"${post.title}" and its uploaded images will be permanently removed.`,
                      confirmLabel: 'Delete post',
                      onConfirm: () => remove(post),
                    })
                  }
                >
                  <kit.Icon name="trash" size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="adm-muted blg-empty">
          {posts.length
            ? 'No posts match these filters.'
            : 'No posts yet. Click “New post” to write your first one.'}
        </p>
      )}
    </div>
  );
}
