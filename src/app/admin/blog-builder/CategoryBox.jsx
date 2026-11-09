'use client';

/* NOTUN FILE: Category create + DELETE (ager moto count 0 hote hobe na).
   Used category delete korle oi post gulo "General" e soriye jay. */
import { useCallback, useEffect, useState } from 'react';

function useCategories(kit, notify, requestConfirm, onRemoved) {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setList((await kit.api('/api/admin/blog/categories')).categories || []);
    } catch (e) {
      notify(e.message, 'error');
    }
  }, [kit, notify]);
  useEffect(() => {
    reload();
  }, [reload]);

  async function create(name) {
    setBusy(true);
    try {
      const data = await kit.api('/api/admin/blog/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setList(data.categories || []);
      notify(`Category "${data.name}" is ready.`, 'success');
      return data.name;
    } catch (e) {
      notify(e.message, 'error');
      return null;
    } finally {
      setBusy(false);
    }
  }

  function remove(category) {
    requestConfirm({
      title: `Delete category "${category.name}"?`,
      message: category.count
        ? `${category.count} post${category.count === 1 ? ' uses' : 's use'} it. ${category.count === 1 ? 'It' : 'They'} will be moved to "General".`
        : 'This category will be removed.',
      confirmLabel: 'Delete category',
      onConfirm: async () => {
        try {
          const data = await kit.api(
            `/api/admin/blog/categories/${encodeURIComponent(category.name)}${category.count ? '?reassign=1' : ''}`,
            { method: 'DELETE' },
          );
          setList(data.categories || []);
          notify(`Category "${category.name}" deleted.`, 'success');
          onRemoved?.(category);
        } catch (e) {
          notify(e.message, 'error');
        }
      },
    });
  }
  return { list, busy, create, remove };
}

const isGeneral = c => c.name.toLowerCase() === 'general';

function Chips({ list, activeName, onPick, onRemove }) {
  return (
    <div className="blg-cat-chips">
      {list.map(c => (
        <span
          key={c.name}
          className={`blg-cat-chip${activeName === c.name ? ' blg-cat-chip-active' : ''}`}
        >
          <button type="button" onClick={() => onPick?.(c.name)}>
            {c.name}
            <small>{c.count}</small>
          </button>
          {!isGeneral(c) && (
            <button
              type="button"
              className="blg-cat-x"
              aria-label={`Delete ${c.name}`}
              title="Delete category"
              onClick={() => onRemove(c)}
            >
              🗑
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

/* Editor sidebar e: type kore select/create + delete */
export function CategoryPicker({
  value,
  onChange,
  kit,
  notify,
  requestConfirm,
}) {
  const { list, busy, create, remove } = useCategories(
    kit,
    notify,
    requestConfirm,
    c => {
      if (c.name.toLowerCase() === value.trim().toLowerCase())
        onChange('General');
    },
  );
  const typed = value.trim();
  const exact = list.find(c => c.name.toLowerCase() === typed.toLowerCase());

  return (
    <div className="blg-cat">
      <input
        className="blg-search"
        value={value}
        maxLength={30}
        placeholder="Type a category, e.g. web"
        aria-label="Category"
        onChange={e => onChange(e.target.value)}
      />
      {typed && !exact ? (
        <div className="blg-cat-new">
          <p className="adm-muted blg-hint">
            New category &quot;{typed}&quot; will be created when you save.
          </p>
          <button
            type="button"
            className="adm-button adm-button-secondary"
            disabled={busy}
            onClick={async () => {
              const n = await create(typed);
              if (n) onChange(n);
            }}
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
      <Chips
        list={list}
        activeName={exact?.name}
        onPick={onChange}
        onRemove={remove}
      />
    </div>
  );
}

/* Post list page e: category gulo manage (create + delete) */
export function CategoryManager({ kit, notify, requestConfirm, onChanged }) {
  const [name, setName] = useState('');
  const { list, busy, create, remove } = useCategories(
    kit,
    notify,
    requestConfirm,
    () => onChanged?.(),
  );
  return (
    <details className="blg-catmanager">
      <summary>Manage categories ({list.length})</summary>
      <div className="blg-cat">
        <div className="blg-inline">
          <input
            className="blg-search"
            value={name}
            maxLength={30}
            placeholder="New category name"
            onChange={e => setName(e.target.value)}
          />
          <button
            type="button"
            className="adm-button adm-button-secondary"
            disabled={busy || !name.trim()}
            onClick={async () => {
              if (await create(name.trim())) setName('');
            }}
          >
            Add
          </button>
        </div>
        <Chips list={list} onRemove={remove} />
        <p className="adm-muted blg-hint">
          Deleting a category moves its posts to &quot;General&quot;.
        </p>
      </div>
    </details>
  );
}
