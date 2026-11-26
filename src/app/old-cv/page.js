// src/app/old-cv/page.js
import CvPageClient from './page-client';
import styles from '../cv/cv.module.css';

const TITLE = 'Adnan Sami — CV';

// Hidden page: not linked anywhere, not in the sitemap, and kept out of search engines.
export const metadata = {
  title: TITLE,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function OldCvPage() {
  return (
    <div className={styles.page}>
      <CvPageClient />
    </div>
  );
}
