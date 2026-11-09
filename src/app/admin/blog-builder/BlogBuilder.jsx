'use client';

/* ==========================================================================
   NOTUN FILE: Visual bilingual blog builder (BlogAdmin.jsx er purono BlogEditor
   er bodole use hoy). Same API: /api/admin/blog  (+ blocks, translations.bn)
   ========================================================================== */
import { useEffect, useMemo, useRef, useState } from 'react';
import bs from '../../blog/blog.module.css';
import { formatDate } from '../../../lib/blog-utils';
import { FormatToolbar, TextBlockBody } from './TextBlock';
import { GalleryBlock, ImageBlock, TextStyleBlock } from './BlockViews';
import { CategoryPicker } from './CategoryBox';
import {
  BLOCK_TYPES,
  blockImages,
  blockLabel,
  cleanBlocks,
  cloneBlocks,
  htmlToBlocks,
  imagesToBlock,
  makeBlock,
  uploadImage,
} from './blocks-util';
import './blog-builder.css';

const LANGS = [
  { key: 'en', label: 'English' },
  { key: 'bn', label: 'বাংলা' },
];
const blankDoc = blocks => ({ title: '', excerpt: '', blocks });

/* ---------------- Live preview (server er renderer = final article) ---------------- */
function Preview({ doc, lang, cover, category, device, kit }) {
  const [html, setHtml] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let dead = false;
    const timer = setTimeout(async () => {
      try {
        const data = await kit.api('/api/admin/blog/preview', {
          method: 'POST',
          body: JSON.stringify({ blocks: cleanBlocks(doc.blocks) }),
        });
        if (!dead) {
          setHtml(data.html || '');
          setErr('');
        }
      } catch (e) {
        if (!dead) setErr(e.message);
      }
    }, 350);
    return () => {
      dead = true;
      clearTimeout(timer);
    };
  }, [doc.blocks, kit]);

  const words = html
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const bn = lang === 'bn';

  return (
    <div className={`bb-pv bb-pv-${device}`}>
      <article className={bs.article} lang={lang}>
        <span className={bs.back}>← All posts</span>
        <h1>{doc.title || (bn ? 'শিরোনামহীন' : 'Untitled post')}</h1>
        <p className={bs.meta}>
          {category} · {formatDate(new Date())} ·{' '}
          {bn
            ? `${new Intl.NumberFormat('bn-BD').format(minutes)} মিনিট পড়া`
            : `${minutes} min read`}
        </p>
        {cover && <img className={bs.postCover} src={cover} alt="" />}
        {err ? (
          <p className="adm-muted">Preview failed: {err}</p>
        ) : (
          <div
            className={bs.prose}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </article>
    </div>
  );
}

/* ---------------- Block frame (drag handle + actions) ---------------- */
function Frame({
  block,
  index,
  total,
  active,
  dragging,
  onSelect,
  onDragStart,
  onDragEnd,
  onMove,
  onDup,
  onDel,
  children,
}) {
  return (
    <div
      data-blk
      className={`bb-block bb-t-${block.type}${active ? ' bb-block-on' : ''}${dragging ? ' bb-dragging' : ''}`}
      onMouseDown={onSelect}
      onFocusCapture={onSelect}
    >
      <div className="bb-bhead">
        <span
          className="bb-handle"
          draggable
          role="button"
          tabIndex={0}
          title="Drag to move this block"
          aria-label="Drag handle"
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          ⋮⋮
        </span>
        <span className="bb-btype">{blockLabel(block)}</span>
        <span className="bb-bact">
          <button
            type="button"
            disabled={index === 0}
            title="Move up"
            aria-label="Move up"
            onClick={() => onMove(-1)}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            title="Move down"
            aria-label="Move down"
            onClick={() => onMove(1)}
          >
            ↓
          </button>
          <button
            type="button"
            title="Duplicate"
            aria-label="Duplicate block"
            onClick={onDup}
          >
            ⧉
          </button>
          <button
            type="button"
            title="Delete block"
            aria-label="Delete block"
            className="bb-del"
            onClick={onDel}
          >
            🗑
          </button>
        </span>
      </div>
      <div className="bb-bbody">{children}</div>
    </div>
  );
}

/* ---------------- Main ---------------- */
export default function BlogBuilder({
  id,
  onClose,
  onSaved,
  notify,
  kit,
  requestConfirm,
}) {
  const [postId, setPostId] = useState(id);
  const [meta, setMeta] = useState({
    slug: '',
    coverImage: '',
    category: '',
    status: 'draft',
  });
  const [docs, setDocs] = useState({
    en: blankDoc([makeBlock('paragraph')]),
    bn: blankDoc([]),
  });
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('edit'); // edit | split | preview
  const [device, setDevice] = useState('desktop');
  const [loaded, setLoaded] = useState(!id);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeEditor, setActiveEditor] = useState(null);
  const [dropAt, setDropAt] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [library, setLibrary] = useState([]);
  const [picked, setPicked] = useState([]);
  const canvasRef = useRef(null);

  const cur = docs[lang];
  const blocks = cur.blocks;
  const live = meta.status === 'published';

  /* ---------- load ---------- */
  useEffect(() => {
    if (!id) return;
    kit
      .api(`/api/admin/blog/${encodeURIComponent(id)}`)
      .then(({ post }) => {
        setMeta({
          slug: post.slug,
          coverImage: post.coverImage || '',
          category: post.category || 'General',
          status: post.status,
        });
        const bn = post.translations?.bn;
        setDocs({
          en: {
            title: post.title,
            excerpt: post.excerpt || '',
            blocks: post.blocks?.length
              ? post.blocks
              : htmlToBlocks(post.contentHtml || ''),
          },
          bn: {
            title: bn?.title || '',
            excerpt: bn?.excerpt || '',
            blocks: bn?.blocks || [],
          },
        });
        setLoaded(true);
      })
      .catch(e => setError(e.message));
  }, [id, kit]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = e => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ---------- state helpers ---------- */
  const patchDoc = patch => {
    setDocs(d => ({ ...d, [lang]: { ...d[lang], ...patch } }));
    setDirty(true);
  };
  const setBlocks = fn => {
    setDocs(d => ({
      ...d,
      [lang]: { ...d[lang], blocks: fn(d[lang].blocks) },
    }));
    setDirty(true);
  };
  const updateBlock = (bid, patch) =>
    setBlocks(bl => bl.map(b => (b.id === bid ? { ...b, ...patch } : b)));
  const insertAt = (index, list) => {
    setBlocks(bl => [...bl.slice(0, index), ...list, ...bl.slice(index)]);
    setActiveId(list[0].id);
  };
  const moveBlock = (bid, toIndex) =>
    setBlocks(bl => {
      const from = bl.findIndex(b => b.id === bid);
      if (from < 0) return bl;
      const list = [...bl];
      const [item] = list.splice(from, 1);
      list.splice(from < toIndex ? toIndex - 1 : toIndex, 0, item);
      return list;
    });
  const moveBy = (bid, delta) =>
    setBlocks(bl => {
      const i = bl.findIndex(b => b.id === bid);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= bl.length) return bl;
      const list = [...bl];
      [list[i], list[j]] = [list[j], list[i]];
      return list;
    });
  const duplicate = bid => {
    const i = blocks.findIndex(b => b.id === bid);
    if (i >= 0) insertAt(i + 1, cloneBlocks([blocks[i]]));
  };
  const removeBlock = bid => setBlocks(bl => bl.filter(b => b.id !== bid));

  const addBlock = kind => {
    const i = blocks.findIndex(b => b.id === activeId);
    insertAt(i >= 0 ? i + 1 : blocks.length, [makeBlock(kind)]);
  };

  /* ---------- images ---------- */
  const allImages = useMemo(
    () => [
      ...new Set(
        [
          ...library,
          meta.coverImage,
          ...blockImages(docs.en.blocks),
          ...blockImages(docs.bn.blocks),
        ].filter(Boolean),
      ),
    ],
    [library, meta.coverImage, docs],
  );
  const usedImages = useMemo(
    () =>
      new Set([...blockImages(docs.en.blocks), ...blockImages(docs.bn.blocks)]),
    [docs],
  );

  async function uploadMany(files) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) {
      notify('Choose image files.', 'error');
      return [];
    }
    setUploading(n => n + imgs.length);
    const urls = [];
    for (const file of imgs) {
      try {
        urls.push(await uploadImage(kit, file));
      } catch (e) {
        notify(e.message, 'error');
      } finally {
        setUploading(n => n - 1);
      }
    }
    setLibrary(l => [...new Set([...urls, ...l])]);
    return urls;
  }
  async function uploadCover(files) {
    const [url] = await uploadMany(files);
    if (url) {
      setMeta(m => ({ ...m, coverImage: url }));
      setDirty(true);
    }
  }
  const togglePick = src =>
    setPicked(p => (p.includes(src) ? p.filter(s => s !== src) : [...p, src]));
  function insertPicked() {
    if (!picked.length) return;
    const i = blocks.findIndex(b => b.id === activeId);
    insertAt(i >= 0 ? i + 1 : blocks.length, [imagesToBlock(picked)]);
    setPicked([]);
  }

  /* ---------- drag & drop (blocks, library images, files from computer) ---------- */
  const dropIndex = e => {
    const nodes = [
      ...(canvasRef.current?.querySelectorAll(':scope > [data-blk]') || []),
    ];
    for (let i = 0; i < nodes.length; i += 1) {
      const r = nodes[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) return i;
    }
    return nodes.length;
  };
  const accepts = e => {
    const t = [...e.dataTransfer.types];
    return (
      t.includes('application/x-blk-move') ||
      t.includes('application/x-blk-lib') ||
      t.includes('Files')
    );
  };
  async function onDrop(e) {
    if (!accepts(e)) return;
    e.preventDefault();
    const at = dropIndex(e);
    setDropAt(null);
    const moveId = e.dataTransfer.getData('application/x-blk-move');
    const lib = e.dataTransfer.getData('application/x-blk-lib');
    if (moveId) return moveBlock(moveId, at);
    if (lib) {
      try {
        const urls = JSON.parse(lib);
        if (urls.length) insertAt(at, [imagesToBlock(urls)]);
      } catch {
        /* ignore */
      }
      return undefined;
    }
    if (e.dataTransfer.files?.length) {
      const urls = await uploadMany(e.dataTransfer.files);
      if (urls.length) insertAt(at, [imagesToBlock(urls)]);
    }
    return undefined;
  }

  /* ---------- save ---------- */
  async function save(status) {
    if (!docs.en.title.trim()) {
      setLang('en');
      return notify('English title is required.', 'error');
    }
    const enBlocks = cleanBlocks(docs.en.blocks);
    if (!enBlocks.length) {
      setLang('en');
      return notify('Write some English content first.', 'error');
    }
    const bnBlocks = cleanBlocks(docs.bn.blocks);
    const hasBn =
      docs.bn.title.trim() || docs.bn.excerpt.trim() || bnBlocks.length;
    setBusy(true);
    try {
      const data = await kit.api(
        postId
          ? `/api/admin/blog/${encodeURIComponent(postId)}`
          : '/api/admin/blog',
        {
          method: postId ? 'PUT' : 'POST',
          body: JSON.stringify({
            title: docs.en.title,
            excerpt: docs.en.excerpt,
            slug: meta.slug,
            coverImage: meta.coverImage,
            category: meta.category,
            status,
            blocks: enBlocks,
            translations: hasBn ? { bn: { ...docs.bn, blocks: bnBlocks } } : {},
          }),
        },
      );
      if (data.id) setPostId(data.id);
      setMeta(m => ({ ...m, status, slug: data.slug || m.slug }));
      setDirty(false);
      setSavedOnce(true);
      notify(
        status === 'published' ? 'Post published.' : 'Draft saved.',
        'success',
      );
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  function back() {
    if (
      dirty &&
      !window.confirm('You have unsaved changes. Leave without saving?')
    )
      return;
    if (savedOnce) onSaved();
    else onClose();
  }

  if (error) return <kit.ErrorBox error={error} onRetry={onClose} />;
  if (!loaded) return <kit.Skeleton cards={2} />;

  const showEdit = view !== 'preview';
  const showPreview = view !== 'edit';
  const bn = lang === 'bn';

  return (
    <div className="adm-view-content bb-root">
      <div className="adm-page-heading">
        <div>
          <button className="adm-text-button" onClick={back}>
            ← Back to posts
          </button>
          <h1>{postId ? 'Edit post' : 'New post'}</h1>
        </div>
        <div className="blg-save-row">
          <span className="bb-seg" role="group" aria-label="View">
            {[
              ['edit', 'Edit'],
              ['split', 'Split'],
              ['preview', 'Live preview'],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={`${view === k ? 'bb-tb-on' : ''}${k === 'split' ? ' bb-only-wide' : ''}`}
                onClick={() => setView(k)}
              >
                {l}
              </button>
            ))}
          </span>
          {live && meta.slug && (
            <a
              className="adm-button adm-button-secondary"
              href={`/blog/${meta.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View live
            </a>
          )}
          <button
            className="adm-button adm-button-secondary"
            disabled={busy || uploading > 0}
            onClick={() => save('draft')}
          >
            {live ? 'Unpublish' : 'Save draft'}
          </button>
          <button
            className="adm-button adm-button-primary"
            disabled={busy || uploading > 0}
            onClick={() => save('published')}
          >
            {busy ? 'Saving…' : live ? 'Update post' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="bb-langtabs" role="tablist" aria-label="Language">
        {LANGS.map(l => {
          const d = docs[l.key];
          const filled = d.title.trim() || cleanBlocks(d.blocks).length;
          return (
            <button
              key={l.key}
              role="tab"
              aria-selected={lang === l.key}
              type="button"
              className={lang === l.key ? 'bb-lang-on' : ''}
              onClick={() => {
                setLang(l.key);
                setActiveId(null);
                setActiveEditor(null);
              }}
            >
              {l.label}{' '}
              {filled ? (
                <i className="bb-dot" title="Has content" />
              ) : (
                <small>(empty)</small>
              )}
            </button>
          );
        })}
        <span className="bb-muted">
          One post, one URL. Both languages publish together.
        </span>
      </div>

      <div className="blg-layout">
        <div className={`blg-main${view === 'split' ? ' bb-split' : ''}`}>
          {showEdit && (
            <div className="bb-editcol">
              <section className="blg-panel" lang={lang}>
                <label className="adm-field">
                  {bn ? 'Bangla title' : 'Title'}
                  <input
                    value={cur.title}
                    maxLength={150}
                    placeholder={bn ? 'বাংলা শিরোনাম' : 'Post title'}
                    onChange={e => patchDoc({ title: e.target.value })}
                  />
                </label>
                <label className="adm-field">
                  {bn ? 'Bangla excerpt' : 'Short excerpt'}{' '}
                  <span className="adm-muted">(optional)</span>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={cur.excerpt}
                    placeholder={
                      bn
                        ? 'এক-দুই লাইনে সারসংক্ষেপ'
                        : 'One or two lines about this post'
                    }
                    onChange={e => patchDoc({ excerpt: e.target.value })}
                  />
                </label>
              </section>

              <section className="blg-panel">
                <div className="bb-sticky">
                  <FormatToolbar editor={activeEditor} />
                </div>
                <AddBar onAdd={addBlock} />

                {bn && blocks.length === 0 && (
                  <div className="bb-empty">
                    <p>No Bangla content yet.</p>
                    <button
                      type="button"
                      className="adm-button adm-button-secondary"
                      onClick={() =>
                        patchDoc({ blocks: cloneBlocks(docs.en.blocks) })
                      }
                    >
                      Copy English layout (then translate the text)
                    </button>{' '}
                    <button
                      type="button"
                      className="adm-button adm-button-secondary"
                      onClick={() =>
                        patchDoc({ blocks: [makeBlock('paragraph')] })
                      }
                    >
                      Start blank
                    </button>
                  </div>
                )}

                <div
                  ref={canvasRef}
                  className={`bb-canvas${draggingId ? ' bb-canvas-drag' : ''}`}
                  lang={lang}
                  onDragOver={e => {
                    if (accepts(e)) {
                      e.preventDefault();
                      setDropAt(dropIndex(e));
                    }
                  }}
                  onDragLeave={e => {
                    if (!canvasRef.current.contains(e.relatedTarget))
                      setDropAt(null);
                  }}
                  onDrop={onDrop}
                >
                  {blocks.map((block, i) => (
                    <FragmentWithLine
                      key={`${lang}-${block.id}`}
                      show={dropAt === i}
                    >
                      <Frame
                        block={block}
                        index={i}
                        total={blocks.length}
                        active={activeId === block.id}
                        dragging={draggingId === block.id}
                        onSelect={() => setActiveId(block.id)}
                        onDragStart={e => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData(
                            'application/x-blk-move',
                            block.id,
                          );
                          const el = e.currentTarget.closest('[data-blk]');
                          if (el) e.dataTransfer.setDragImage(el, 20, 20);
                          setDraggingId(block.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropAt(null);
                        }}
                        onMove={d => moveBy(block.id, d)}
                        onDup={() => duplicate(block.id)}
                        onDel={() => removeBlock(block.id)}
                      >
                        {block.type === 'text' && (
                          <TextBlockBody
                            block={block}
                            onChange={patch => updateBlock(block.id, patch)}
                            onActive={ed => {
                              setActiveEditor(ed);
                              setActiveId(block.id);
                            }}
                            onRelease={ed =>
                              setActiveEditor(c => (c === ed ? null : c))
                            }
                          />
                        )}
                        {(block.type === 'meta' || block.type === 'custom') && (
                          <TextStyleBlock
                            block={block}
                            onChange={patch => updateBlock(block.id, patch)}
                          />
                        )}
                        {block.type === 'image' && (
                          <ImageBlock
                            block={block}
                            busy={uploading > 0}
                            uploadMany={uploadMany}
                            onChange={patch => updateBlock(block.id, patch)}
                          />
                        )}
                        {block.type === 'gallery' && (
                          <GalleryBlock
                            block={block}
                            busy={uploading > 0}
                            uploadMany={uploadMany}
                            libraryPicked={picked}
                            clearPicked={() => setPicked([])}
                            onChange={patch => updateBlock(block.id, patch)}
                          />
                        )}
                        {block.type === 'divider' && <hr className="bb-hr" />}
                      </Frame>
                    </FragmentWithLine>
                  ))}
                  {dropAt === blocks.length && <div className="bb-dropline" />}
                  {blocks.length > 0 && (
                    <p className="bb-droptip">
                      Drag blocks by ⋮⋮, or drop images from your computer / the
                      library anywhere here.
                    </p>
                  )}
                </div>
                {blocks.length > 0 && <AddBar onAdd={addBlock} />}
              </section>
            </div>
          )}

          {showPreview && (
            <section
              className={`blg-panel bb-pvpanel${view === 'split' ? ' bb-pv-sticky' : ''}`}
            >
              <div className="bb-pvhead">
                <p className="adm-eyebrow">
                  LIVE PREVIEW · {bn ? 'বাংলা' : 'English'}
                </p>
                <span className="bb-seg" role="group" aria-label="Device">
                  {[
                    ['desktop', '🖥 Desktop'],
                    ['mobile', '📱 Mobile'],
                  ].map(([k, l]) => (
                    <button
                      key={k}
                      type="button"
                      className={device === k ? 'bb-tb-on' : ''}
                      onClick={() => setDevice(k)}
                    >
                      {l}
                    </button>
                  ))}
                </span>
              </div>
              <Preview
                doc={cur}
                lang={lang}
                cover={meta.coverImage}
                category={meta.category || 'General'}
                device={device}
                kit={kit}
              />
            </section>
          )}
        </div>

        <aside className="blg-side">
          <section className="blg-panel">
            <p className="adm-eyebrow">CATEGORY</p>
            <CategoryPicker
              value={meta.category}
              onChange={name => {
                setMeta(m => ({ ...m, category: name }));
                setDirty(true);
              }}
              kit={kit}
              notify={notify}
              requestConfirm={requestConfirm}
            />
          </section>

          <section className="blg-panel">
            <p className="adm-eyebrow">COVER IMAGE</p>
            {meta.coverImage ? (
              <img className="blg-cover-prev" src={meta.coverImage} alt="" />
            ) : (
              <div className="blg-cover-empty">No cover yet</div>
            )}
            <div className="blg-cover-actions">
              <label className="adm-button adm-button-secondary blg-filelabel">
                {uploading
                  ? 'Uploading…'
                  : meta.coverImage
                    ? 'Change'
                    : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => {
                    uploadCover(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
              {meta.coverImage && (
                <button
                  className="adm-button adm-button-danger"
                  onClick={() => {
                    setMeta(m => ({ ...m, coverImage: '' }));
                    setDirty(true);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </section>

          <section className="blg-panel">
            <p className="adm-eyebrow">IMAGE LIBRARY</p>
            <label className="adm-button adm-button-secondary blg-filelabel">
              {uploading
                ? `Uploading ${uploading}…`
                : 'Upload images (multiple)'}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => {
                  uploadMany(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
            {allImages.length ? (
              <div className="bb-lib">
                {allImages.map(src => (
                  <button
                    key={src}
                    type="button"
                    draggable
                    className={`bb-libitem${picked.includes(src) ? ' bb-libitem-on' : ''}`}
                    title="Click to select. Drag into the article."
                    onClick={() => togglePick(src)}
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData(
                        'application/x-blk-lib',
                        JSON.stringify(picked.includes(src) ? picked : [src]),
                      );
                    }}
                  >
                    <img src={src} alt="" draggable={false} />
                    {usedImages.has(src) && (
                      <i className="bb-used" title="Used in this post">
                        ✓
                      </i>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="adm-muted blg-hint">
                No images yet. Upload some, or drop files into the article.
              </p>
            )}
            {picked.length > 0 && (
              <div className="blg-cover-actions">
                <button
                  type="button"
                  className="adm-button adm-button-primary"
                  onClick={insertPicked}
                >
                  Insert{' '}
                  {picked.length === 1
                    ? 'image'
                    : `${picked.length} as gallery`}
                </button>
                <button
                  type="button"
                  className="adm-button adm-button-secondary"
                  onClick={() => setPicked([])}
                >
                  Clear
                </button>
              </div>
            )}
          </section>

          <section className="blg-panel">
            <p className="adm-eyebrow">LINK</p>
            <label className="adm-field">
              Slug <span className="adm-muted">(auto from title if empty)</span>
              <input
                value={meta.slug}
                placeholder="my-first-post"
                onChange={e => {
                  setMeta(m => ({ ...m, slug: e.target.value }));
                  setDirty(true);
                }}
              />
            </label>
            <p className="adm-muted blg-hint">
              Status: <strong>{live ? 'Published' : 'Draft'}</strong>
              {dirty ? ' · unsaved changes' : ''}. The Bangla version is shown
              on the same URL with a language switch.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function FragmentWithLine({ show, children }) {
  return (
    <>
      {show && <div className="bb-dropline" />}
      {children}
    </>
  );
}

function AddBar({ onAdd }) {
  return (
    <div className="bb-addbar" role="group" aria-label="Add block">
      <span className="bb-muted">Add block:</span>
      {BLOCK_TYPES.map(t => (
        <button key={t.key} type="button" onClick={() => onAdd(t.key)}>
          <span aria-hidden="true">{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}
