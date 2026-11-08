import Link from 'next/link';
import { notFound } from 'next/navigation';
import PortfolioHeader from '../../components/PortfolioHeader';
import { getPublicPost } from '../../../lib/blog-store';
import { formatDate } from '../../../lib/blog-utils';
import styles from '../blog.module.css';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return { title: 'Post not found | adnanzeros' };
  return {
    title: `${post.title} | adnanzeros`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();

  return (
    <>
      <PortfolioHeader base="/" />
      <main className={styles.page}>
        <article className={styles.article}>
          <Link href="/blog" className={styles.back}>
            <span aria-hidden="true">&larr;</span> All posts
          </Link>
          <h1>{post.title}</h1>
          <p className={styles.meta}>
            {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
          {post.coverImage && (
            <img className={styles.postCover} src={post.coverImage} alt="" />
          )}
          {/* contentHtml server e sanitize kora, admin chhara keu likhte pare na */}
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </main>
    </>
  );
}
