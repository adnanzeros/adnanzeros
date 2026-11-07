import Link from 'next/link';
import styles from './LegalPage.module.css';

/* Privacy ar Terms duto page-i ei ekta component use kore */
export default function LegalPage({ kicker, title, updated, intro, sections }) {
  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Link href="/" className="brand">
          <img src="/favicon.svg" alt="" width="34" height="34" />
          adnanzeros
        </Link>
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </div>

      <header className={styles.hero}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated: {updated}</p>
      </header>

      <article className={styles.card}>
        <p className={styles.intro}>{intro}</p>
        {sections.map(section => (
          <section className={styles.section} key={section.title}>
            <h2>{section.title}</h2>
            {section.body}
          </section>
        ))}
        <p className={styles.note}>
          This page is a plain-language policy for a personal portfolio website.
          If anything here is unclear, email{' '}
          <a href="mailto:asadnanzeros@gmail.com">asadnanzeros@gmail.com</a>.
        </p>
      </article>

      <nav className={styles.foot} aria-label="Legal">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Use</Link>
        <Link href="/">Home</Link>
        <span>&copy; {new Date().getFullYear()} Adnan Sami (adnanzeros)</span>
      </nav>
    </main>
  );
}
