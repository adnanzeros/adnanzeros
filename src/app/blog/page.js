import PortfolioHeader from '../components/PortfolioHeader';
import { getPublicPosts } from '../../lib/blog-store';
import BlogList from './BlogList';
import styles from './blog.module.css';

export const revalidate = 60;

export const metadata = {
  title: 'Blog | adnanzeros (Adnan Sami)',
  description:
    'Articles, notes and growth stories from Adnan Sami (adnanzeros), web designer and frontend developer from Bangladesh.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getPublicPosts();
  return (
    <>
      <PortfolioHeader base="/" />
      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Growth</p>
          <h1>Blog</h1>
          <p>Notes, stories and lessons from building things on the web.</p>
        </header>
        <BlogList posts={posts} />
      </main>
    </>
  );
}
