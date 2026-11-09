'use client';

/* NOTUN FILE: Meta/custom text, Image ar Gallery block er editor UI */
import { useState } from 'react';
import { makeImage } from './blocks-util';

const ALIGN = [
  ['left', '⇤', 'Left'],
  ['center', '↔', 'Center'],
  ['right', '⇥', 'Right'],
];

function AlignButtons({ value, onChange }) {
  return (
    <span className="bb-seg" role="group" aria-label="Align">
      {ALIGN.map(([key, icon, label]) => (
        <button
          key={key}
          type="button"
          title={label}
          aria-label={label}
          className={value === key ? 'bb-tb-on' : ''}
          onClick={() => onChange(key)}
        >
          {icon}
        </button>
      ))}
    </span>
  );
}

const Field = ({ label, children }) => (
  <label className="bb-field">
    <span>{label}</span>
    {children}
  </label>
);

/* ---------------- Meta line / Custom text ---------------- */
export function TextStyleBlock({ block, onChange }) {
  const st = block.style;
  const set = patch => onChange({ style: { ...st, ...patch } });
  const css = {
    fontSize: `${st.fontSize}px`,
    color: st.color || undefined,
    background: st.background || undefined,
    fontWeight: st.weight,
    fontStyle: st.italic ? 'italic' : 'normal',
    textTransform: st.uppercase ? 'uppercase' : 'none',
    letterSpacing: `${st.letterSpacing}px`,
    textAlign: st.align,
    ...(st.pill
      ? { display: 'inline-block', padding: '.35em .9em', borderRadius: 999 }
      : {}),
  };
  return (
    <div className="bb-stylebox">
      <div className="bb-metastage" style={{ textAlign: st.align }}>
        <input
          className="bb-metainput"
          style={css}
          value={block.text}
          maxLength={300}
          placeholder={
            block.type === 'meta'
              ? '5 MIN READ · TECHNOLOGY'
              : 'Type your text…'
          }
          aria-label="Block text"
          onChange={e => onChange({ text: e.target.value })}
        />
      </div>
      <div className="bb-controls">
        <Field label="Size (px)">
          <input
            type="number"
            min="8"
            max="96"
            value={st.fontSize}
            onChange={e => set({ fontSize: Number(e.target.value) || 16 })}
          />
        </Field>
        <Field label="Weight">
          <select
            value={st.weight}
            onChange={e => set({ weight: Number(e.target.value) })}
          >
            {[400, 500, 600, 700, 800].map(w => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Spacing (px)">
          <input
            type="number"
            min="0"
            max="8"
            step="0.5"
            value={st.letterSpacing}
            onChange={e => set({ letterSpacing: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Text color">
          <input
            type="color"
            value={st.color || '#1d2740'}
            onChange={e => set({ color: e.target.value })}
          />
        </Field>
        <Field label="Background">
          <span className="bb-inline">
            <input
              type="color"
              value={st.background || '#ffffff'}
              onChange={e => set({ background: e.target.value })}
            />
            {st.background && (
              <button
                type="button"
                className="bb-mini"
                onClick={() => set({ background: '' })}
              >
                None
              </button>
            )}
          </span>
        </Field>
        <label className="bb-check">
          <input
            type="checkbox"
            checked={st.uppercase}
            onChange={e => set({ uppercase: e.target.checked })}
          />{' '}
          UPPERCASE
        </label>
        <label className="bb-check">
          <input
            type="checkbox"
            checked={st.italic}
            onChange={e => set({ italic: e.target.checked })}
          />{' '}
          Italic
        </label>
        <label className="bb-check">
          <input
            type="checkbox"
            checked={st.pill}
            onChange={e => set({ pill: e.target.checked })}
          />{' '}
          Pill / badge
        </label>
        <AlignButtons value={st.align} onChange={align => set({ align })} />
      </div>
    </div>
  );
}

/* ---------------- Single image ---------------- */
export function ImageBlock({ block, onChange, uploadMany, busy }) {
  const stageAlign = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[block.align];

  async function pickFile(files) {
    const [url] = await uploadMany(files);
    if (url) onChange({ src: url });
  }

  return (
    <div className="bb-imgblock">
      {block.src ? (
        <div className="bb-imgstage" style={{ justifyContent: stageAlign }}>
          <figure style={{ width: `${block.width}%` }}>
            <img src={block.src} alt={block.alt} />
            {(block.caption || block.meta) && (
              <figcaption>
                {block.caption && <strong>{block.caption}</strong>}
                {block.meta && <span>{block.meta}</span>}
              </figcaption>
            )}
          </figure>
        </div>
      ) : (
        <label className="bb-drop">
          {busy
            ? 'Uploading…'
            : '🖼  Click to choose an image, or drop one here'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={e => {
              pickFile(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}
      <div className="bb-controls">
        <Field label={`Width ${block.width}%`}>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={block.width}
            onChange={e => onChange({ width: Number(e.target.value) })}
          />
        </Field>
        <AlignButtons
          value={block.align}
          onChange={align => onChange({ align })}
        />
        <label className="bb-mini bb-filemini">
          {block.src ? 'Replace image' : 'Choose image'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={e => {
              pickFile(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <div className="bb-controls bb-grid3">
        <Field label="Caption">
          <input
            value={block.caption}
            maxLength={200}
            placeholder="Image caption"
            onChange={e => onChange({ caption: e.target.value })}
          />
        </Field>
        <Field label="Place · time">
          <input
            value={block.meta}
            maxLength={200}
            placeholder="Dhaka · 8 Nov 2026"
            onChange={e => onChange({ meta: e.target.value })}
          />
        </Field>
        <Field label="Alt text">
          <input
            value={block.alt}
            maxLength={200}
            placeholder="Describe the image"
            onChange={e => onChange({ alt: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

/* ---------------- Gallery ---------------- */
export function GalleryBlock({
  block,
  onChange,
  uploadMany,
  busy,
  libraryPicked,
  clearPicked,
}) {
  const [sel, setSel] = useState(0);
  const [over, setOver] = useState(null);
  const images = block.images;
  const cur = images[Math.min(sel, images.length - 1)];
  const setImages = list => onChange({ images: list });
  const patchImg = (id, patch) =>
    setImages(images.map(i => (i.id === id ? { ...i, ...patch } : i)));

  function move(from, to) {
    if (from === to || to < 0 || to >= images.length) return;
    const list = [...images];
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    setImages(list);
    setSel(to);
  }
  async function addFiles(files) {
    const urls = await uploadMany(files);
    if (urls.length) setImages([...images, ...urls.map(makeImage)]);
  }
  function addPicked() {
    setImages([...images, ...libraryPicked.map(makeImage)]);
    clearPicked();
  }

  return (
    <div className="bb-gallery">
      {images.length ? (
        <div
          className="bb-galgrid"
          style={{
            gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))`,
            gap: block.gap,
          }}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`bb-thumb${i === sel ? ' bb-thumb-on' : ''}${over === i ? ' bb-thumb-over' : ''}`}
              draggable
              onClick={() => setSel(i)}
              onDragStart={e => {
                e.stopPropagation();
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/x-gal-img', String(i));
              }}
              onDragOver={e => {
                if (
                  [...e.dataTransfer.types].includes('application/x-gal-img')
                ) {
                  e.preventDefault();
                  e.stopPropagation();
                  setOver(i);
                }
              }}
              onDragLeave={() => setOver(null)}
              onDrop={e => {
                const from = e.dataTransfer.getData('application/x-gal-img');
                if (from === '') return;
                e.preventDefault();
                e.stopPropagation();
                setOver(null);
                move(Number(from), i);
              }}
              onDragEnd={() => setOver(null)}
            >
              <img src={img.src} alt={img.alt} draggable={false} />
              <span className="bb-thumb-n">{i + 1}</span>
              <button
                type="button"
                className="bb-thumb-x"
                aria-label="Remove image"
                onClick={e => {
                  e.stopPropagation();
                  setImages(images.filter(x => x.id !== img.id));
                  setSel(0);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <label className="bb-drop">
          {busy ? 'Uploading…' : '▦  Click to add multiple images'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}

      <div className="bb-controls">
        <span className="bb-seg" role="group" aria-label="Columns">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              type="button"
              className={block.columns === n ? 'bb-tb-on' : ''}
              onClick={() => onChange({ columns: n })}
              title={`${n} column${n > 1 ? 's' : ''}`}
            >
              {n}
            </button>
          ))}
        </span>
        <span className="bb-muted">columns</span>
        <Field label="Gap">
          <select
            value={block.gap}
            onChange={e => onChange({ gap: Number(e.target.value) })}
          >
            {[0, 8, 12, 16, 24].map(g => (
              <option key={g} value={g}>
                {g}px
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Width ${block.width}%`}>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={block.width}
            onChange={e => onChange({ width: Number(e.target.value) })}
          />
        </Field>
        <AlignButtons
          value={block.align}
          onChange={align => onChange({ align })}
        />
        <label className="bb-mini bb-filemini">
          + Upload images
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        {libraryPicked.length > 0 && (
          <button type="button" className="bb-mini" onClick={addPicked}>
            + Add {libraryPicked.length} selected from library
          </button>
        )}
      </div>

      {cur && (
        <div className="bb-controls bb-grid3 bb-curimg">
          <Field label={`Image ${images.indexOf(cur) + 1} caption`}>
            <input
              value={cur.caption}
              maxLength={200}
              onChange={e => patchImg(cur.id, { caption: e.target.value })}
            />
          </Field>
          <Field label="Place · time">
            <input
              value={cur.meta}
              maxLength={200}
              onChange={e => patchImg(cur.id, { meta: e.target.value })}
            />
          </Field>
          <Field label="Alt text">
            <input
              value={cur.alt}
              maxLength={200}
              onChange={e => patchImg(cur.id, { alt: e.target.value })}
            />
          </Field>
          <span className="bb-inline">
            <button
              type="button"
              className="bb-mini"
              onClick={() => move(images.indexOf(cur), images.indexOf(cur) - 1)}
            >
              ◀ Move earlier
            </button>
            <button
              type="button"
              className="bb-mini"
              onClick={() => move(images.indexOf(cur), images.indexOf(cur) + 1)}
            >
              Move later ▶
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
