import { getPublicPosts } from '../lib/blog-store';

const BASE_URL = 'https://adnanzeros.vercel.app';
const LAST_MODIFIED = new Date('2026-11-08');

export default async function sitemap() {
  const posts = await getPublicPosts();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/cv`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: posts[0]?.updatedAt
        ? new Date(posts[0].updatedAt)
        : LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    {
      url: `${BASE_URL}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
