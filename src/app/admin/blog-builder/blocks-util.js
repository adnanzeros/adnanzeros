/* NOTUN FILE: Block helper (id, default block, legacy HTML -> block, upload) */

export const uid = () =>
  `b${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

/* Server er default er sathe mile (blog.blocks.js) */
export const META_STYLE = {
  fontSize: 12,
  color: '#6b7280',
  background: '',
  weight: 700,
  italic: false,
  uppercase: true,
  letterSpacing: 1.5,
  align: 'left',
  pill: false,
};
export const CUSTOM_STYLE = {
  fontSize: 16,
  color: '',
  background: '',
  weight: 400,
  italic: false,
  uppercase: false,
  letterSpacing: 0,
  align: 'left',
  pill: false,
};

export const BLOCK_TYPES = [
  { key: 'paragraph', label: 'Paragraph', icon: '¶' },
  { key: 'heading', label: 'Heading', icon: 'H' },
  { key: 'quote', label: 'Quote', icon: '❝' },
  { key: 'meta', label: 'Meta line', icon: '🏷' },
  { key: 'custom', label: 'Custom text', icon: '✎' },
  { key: 'image', label: 'Image', icon: '🖼' },
  { key: 'gallery', label: 'Gallery', icon: '▦' },
  { key: 'divider', label: 'Divider', icon: '―' },
];

export const blockLabel = block => {
  if (block.type === 'text')
    return (
      { heading: 'Heading', quote: 'Quote', paragraph: 'Text' }[
        block.variant
      ] || 'Text'
    );
  return (
    {
      meta: 'Meta line',
      custom: 'Custom text',
      image: 'Image',
      gallery: 'Gallery',
      divider: 'Divider',
    }[block.type] || 'Block'
  );
};

export function makeBlock(kind, extra = {}) {
  const id = uid();
  switch (kind) {
    case 'heading':
      return {
        id,
        type: 'text',
        variant: 'heading',
        html: '<h2></h2>',
        ...extra,
      };
    case 'quote':
      return {
        id,
        type: 'text',
        variant: 'quote',
        html: '<blockquote><p></p></blockquote>',
        ...extra,
      };
    case 'meta':
      return {
        id,
        type: 'meta',
        text: '5 MIN READ · TECHNOLOGY',
        style: { ...META_STYLE },
        ...extra,
      };
    case 'custom':
      return {
        id,
        type: 'custom',
        text: '',
        style: { ...CUSTOM_STYLE },
        ...extra,
      };
    case 'image':
      return {
        id,
        type: 'image',
        src: '',
        alt: '',
        caption: '',
        meta: '',
        width: 100,
        align: 'center',
        ...extra,
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        columns: 3,
        gap: 12,
        width: 100,
        align: 'center',
        images: [],
        ...extra,
      };
    case 'divider':
      return { id, type: 'divider', ...extra };
    default:
      return {
        id,
        type: 'text',
        variant: 'paragraph',
        html: '<p></p>',
        ...extra,
      };
  }
}

export const makeImage = src => ({
  id: uid(),
  src,
  alt: '',
  caption: '',
  meta: '',
});

export const imagesToBlock = urls =>
  urls.length === 1
    ? makeBlock('image', { src: urls[0] })
    : makeBlock('gallery', { images: urls.map(makeImage) });

/* Onno language er layout copy korar jonno (notun id soho) */
export const cloneBlocks = blocks =>
  JSON.parse(JSON.stringify(blocks)).map(b => ({
    ...b,
    id: uid(),
    ...(b.images ? { images: b.images.map(i => ({ ...i, id: uid() })) } : {}),
  }));

export const isBlank = b => {
  if (b.type === 'text')
    return (
      !b.html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim() && !/<(table|pre|img|hr)/i.test(b.html)
    );
  if (b.type === 'meta' || b.type === 'custom') return !String(b.text).trim();
  if (b.type === 'image') return !b.src;
  if (b.type === 'gallery') return !b.images?.length;
  return false;
};
export const cleanBlocks = blocks => blocks.filter(b => !isBlank(b));

export const blockImages = blocks =>
  blocks.flatMap(b =>
    b.type === 'image'
      ? [b.src]
      : b.type === 'gallery'
        ? b.images.map(i => i.src)
        : [],
  );

/* Purono post (shudhu contentHtml) ke block e vangi, tai ager post gulo edit kora jay */
export function htmlToBlocks(html = '') {
  if (!html.trim()) return [makeBlock('paragraph')];
  const doc = new DOMParser().parseFromString(
    `<body>${html}</body>`,
    'text/html',
  );
  const out = [];
  doc.body.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      if (t)
        out.push(
          makeBlock('paragraph', {
            html: `<p>${t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</p>`,
          }),
        );
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (/^H[2-4]$/.test(tag))
      out.push(makeBlock('heading', { html: node.outerHTML }));
    else if (tag === 'BLOCKQUOTE')
      out.push(makeBlock('quote', { html: node.outerHTML }));
    else if (tag === 'HR') out.push(makeBlock('divider'));
    else if (tag === 'FIGURE' || tag === 'IMG') {
      const img = tag === 'IMG' ? node : node.querySelector('img');
      if (img?.getAttribute('src'))
        out.push(
          makeBlock('image', {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            caption: node.querySelector?.('.cap-title')?.textContent || '',
            meta: node.querySelector?.('.cap-meta')?.textContent || '',
          }),
        );
    } else if (node.textContent.trim() || node.querySelector('img,table')) {
      out.push(makeBlock('paragraph', { html: node.outerHTML }));
    }
  });
  return out.length ? out : [makeBlock('paragraph')];
}

/* Image upload (existing /api/admin/upload endpoint, compress kore) */
export async function uploadImage(kit, file) {
  if (!file || !file.type.startsWith('image/'))
    throw new Error('Choose an image file to upload.');
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
  if (!response.ok || !data.url)
    throw new Error(data.error || `Upload failed (${response.status}).`);
  return data.url;
}
