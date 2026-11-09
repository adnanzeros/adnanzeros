'use client';

/* NOTUN FILE: Tiptap text block + shared formatting toolbar */
import { useEffect, useRef } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extension-placeholder';

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, autolink: true },
  }),
  TextStyle,
  Color,
  FontSize,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table,
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === 'heading' ? 'Heading…' : 'Write something…',
  }),
];

const variantOf = editor => {
  const first = editor.state.doc.firstChild?.type.name;
  return first === 'heading'
    ? 'heading'
    : first === 'blockquote'
      ? 'quote'
      : 'paragraph';
};

/* Ekta block = ekta Tiptap editor. Focus korle toolbar ei editor ke control kore */
export function TextBlockBody({ block, onChange, onActive, onRelease }) {
  const cb = useRef({});
  cb.current = { onChange, onActive, onRelease };

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: block.html,
    editorProps: { attributes: { class: 'bb-prose', spellcheck: 'true' } },
    onUpdate: ({ editor: e }) =>
      cb.current.onChange({ html: e.getHTML(), variant: variantOf(e) }),
    onFocus: ({ editor: e }) => cb.current.onActive(e),
  });

  useEffect(
    () => () => {
      if (editor) cb.current.onRelease(editor);
    },
    [editor],
  );

  return <EditorContent editor={editor} />;
}

/* ---------------- Toolbar ---------------- */
const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

export function FormatToolbar({ editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e || e.isDestroyed) return null;
      const ts = e.getAttributes('textStyle');
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        strike: e.isActive('strike'),
        code: e.isActive('code'),
        codeBlock: e.isActive('codeBlock'),
        link: e.isActive('link'),
        h2: e.isActive('heading', { level: 2 }),
        h3: e.isActive('heading', { level: 3 }),
        h4: e.isActive('heading', { level: 4 }),
        quote: e.isActive('blockquote'),
        bullet: e.isActive('bulletList'),
        ordered: e.isActive('orderedList'),
        table: e.isActive('table'),
        left: e.isActive({ textAlign: 'left' }),
        center: e.isActive({ textAlign: 'center' }),
        right: e.isActive({ textAlign: 'right' }),
        size: parseInt(ts.fontSize, 10) || '',
        color: ts.color || '',
      };
    },
  });
  const on = Boolean(s && editor);
  const chain = () => editor.chain().focus();

  function setSize(value) {
    if (!on) return;
    const n = Math.round(Number(value));
    const { empty, to } = editor.state.selection;
    let c = chain();
    if (empty) c = c.selectAll(); // selection na thakle poora block e lagbe
    if (!n) c = c.unsetFontSize();
    else c = c.setFontSize(`${Math.min(96, Math.max(8, n))}px`);
    c.run();
    if (empty) editor.chain().focus().setTextSelection(to).run();
  }
  function addLink() {
    if (!on) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt(
      'Link URL (https://…). Leave empty to remove.',
      prev,
    );
    if (url === null) return;
    if (!url.trim()) return chain().extendMarkRange('link').unsetLink().run();
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim()))
      return window.alert('Link must start with http://, https:// or mailto:');
    chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  const Btn = ({ label, title, act, run, disabled }) => (
    <button
      type="button"
      className={act ? 'bb-tb-on' : ''}
      title={title}
      aria-label={title}
      disabled={!on || disabled}
      onMouseDown={e => e.preventDefault()}
      onClick={run}
    >
      {label}
    </button>
  );

  return (
    <div className="bb-toolbar" role="toolbar" aria-label="Text formatting">
      <Btn
        label="¶"
        title="Paragraph"
        act={s && !s.h2 && !s.h3 && !s.h4 && !s.quote}
        run={() => chain().setParagraph().run()}
      />
      <Btn
        label="H2"
        title="Heading 2"
        act={s?.h2}
        run={() => chain().toggleHeading({ level: 2 }).run()}
      />
      <Btn
        label="H3"
        title="Heading 3"
        act={s?.h3}
        run={() => chain().toggleHeading({ level: 3 }).run()}
      />
      <Btn
        label="H4"
        title="Heading 4"
        act={s?.h4}
        run={() => chain().toggleHeading({ level: 4 }).run()}
      />
      <span className="bb-sep" />
      <Btn
        label={<b>B</b>}
        title="Bold"
        act={s?.bold}
        run={() => chain().toggleBold().run()}
      />
      <Btn
        label={<i>I</i>}
        title="Italic"
        act={s?.italic}
        run={() => chain().toggleItalic().run()}
      />
      <Btn
        label={<u>U</u>}
        title="Underline"
        act={s?.underline}
        run={() => chain().toggleUnderline().run()}
      />
      <Btn
        label={<s>S</s>}
        title="Strikethrough"
        act={s?.strike}
        run={() => chain().toggleStrike().run()}
      />
      <Btn label="🔗" title="Link" act={s?.link} run={addLink} />
      <span className="bb-sep" />
      <div className="bb-size" title="Font size (px)">
        <button
          type="button"
          disabled={!on}
          onMouseDown={e => e.preventDefault()}
          onClick={() => setSize((s?.size || 16) - 1)}
          aria-label="Smaller"
        >
          −
        </button>
        <input
          key={s?.size ?? 'none'}
          type="number"
          min="8"
          max="96"
          list="bb-sizes"
          disabled={!on}
          defaultValue={s?.size ?? ''}
          placeholder="px"
          aria-label="Font size in px"
          onBlur={e =>
            e.target.value !== String(s?.size ?? '') && setSize(e.target.value)
          }
          onKeyDown={e =>
            e.key === 'Enter' &&
            (e.preventDefault(), setSize(e.currentTarget.value))
          }
        />
        <span>px</span>
        <button
          type="button"
          disabled={!on}
          onMouseDown={e => e.preventDefault()}
          onClick={() => setSize((s?.size || 16) + 1)}
          aria-label="Larger"
        >
          +
        </button>
        <datalist id="bb-sizes">
          {SIZES.map(n => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
      <input
        type="color"
        className="bb-color"
        title="Text color"
        disabled={!on}
        value={/^#[0-9a-f]{6}$/i.test(s?.color || '') ? s.color : '#1d2740'}
        onChange={e => chain().setColor(e.target.value).run()}
      />
      <Btn
        label="⌫"
        title="Clear formatting"
        run={() => chain().unsetAllMarks().unsetFontSize().run()}
      />
      <span className="bb-sep" />
      <Btn
        label="⇤"
        title="Align left"
        act={s?.left}
        run={() => chain().setTextAlign('left').run()}
      />
      <Btn
        label="↔"
        title="Align center"
        act={s?.center}
        run={() => chain().setTextAlign('center').run()}
      />
      <Btn
        label="⇥"
        title="Align right"
        act={s?.right}
        run={() => chain().setTextAlign('right').run()}
      />
      <span className="bb-sep" />
      <Btn
        label="•"
        title="Bullet list"
        act={s?.bullet}
        run={() => chain().toggleBulletList().run()}
      />
      <Btn
        label="1."
        title="Numbered list"
        act={s?.ordered}
        run={() => chain().toggleOrderedList().run()}
      />
      <Btn
        label="❝"
        title="Quote"
        act={s?.quote}
        run={() => chain().toggleBlockquote().run()}
      />
      <Btn
        label="</>"
        title="Code block"
        act={s?.codeBlock}
        run={() => chain().toggleCodeBlock().run()}
      />
      <Btn
        label="▦ Table"
        title="Insert table"
        run={() =>
          chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      />
      {s?.table && (
        <span className="bb-tablebar">
          <Btn
            label="+Row"
            title="Add row below"
            run={() => chain().addRowAfter().run()}
          />
          <Btn
            label="+Col"
            title="Add column right"
            run={() => chain().addColumnAfter().run()}
          />
          <Btn
            label="−Row"
            title="Delete row"
            run={() => chain().deleteRow().run()}
          />
          <Btn
            label="−Col"
            title="Delete column"
            run={() => chain().deleteColumn().run()}
          />
          <Btn
            label="✕ Table"
            title="Delete table"
            run={() => chain().deleteTable().run()}
          />
        </span>
      )}
      <span className="bb-sep" />
      <Btn label="↶" title="Undo" run={() => chain().undo().run()} />
      <Btn label="↷" title="Redo" run={() => chain().redo().run()} />
      {!on && (
        <span className="bb-tb-hint">Click a text block to format it</span>
      )}
    </div>
  );
}
