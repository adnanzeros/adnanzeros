const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(
  /\/+$/,
  '',
);

export async function getPublicPosts() {
  try {
    const res = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.posts) ? data.posts : [];
  } catch (error) {
    console.error('[blog] list failed:', error);
    return [];
  }
}

export async function getPublicPost(slug) {
  try {
    const res = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
  } catch (error) {
    console.error('[blog] post failed:', error);
    return null;
  }
}
