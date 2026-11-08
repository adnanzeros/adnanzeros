/* Blog date helper: sob din Bangladesh time (Asia/Dhaka) onujayi hishab hoy */
const TZ = 'Asia/Dhaka';

/* Category ekhon dynamic: admin type kore banay, tai kono fixed list nai.
   Post gulo theke category list banano hoy: [{ name, count }] */
export const DEFAULT_CATEGORY = 'General';

export const categoriesFromPosts = posts => {
  const counts = new Map();
  for (const post of posts || []) {
    const name = String(post.category || '').trim() || DEFAULT_CATEGORY;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const dayNumber = value => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
  const [y, m, d] = parts.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

export const DATE_FILTERS = [
  ['all', 'All time'],
  ['today', 'Today'],
  ['yesterday', 'Yesterday'],
  ['week', 'Last 7 days'],
  ['month', 'Last 30 days'],
  ['older', 'Older than 30 days'],
];

export function matchesDateFilter(value, filter, now = Date.now()) {
  if (filter === 'all') return true;
  if (!value) return false;
  const diff = dayNumber(now) - dayNumber(value);
  if (filter === 'today') return diff === 0;
  if (filter === 'yesterday') return diff === 1;
  if (filter === 'week') return diff >= 0 && diff <= 7;
  if (filter === 'month') return diff >= 0 && diff <= 30;
  if (filter === 'older') return diff > 30;
  return true;
}

export const formatDate = value =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '';

/* ★ NOTUN: Date + time (Bangladesh time), jemon: 4 Nov 2026, 9:41 pm */
export const formatDateTime = value =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(value))
    : '';
