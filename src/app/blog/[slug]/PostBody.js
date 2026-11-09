'use client';

/* NOTUN FILE: Public post body with English / Bangla switch (same URL: /blog/[slug]).
   Bangla version thakle-i shudhu eta use hoy; na thakle ager markup-i thake. */
import { useEffect, useState } from 'react';
import styles from '../blog.module.css';

export default function PostBody({
  title,
  dateText,
  minutes,
  cover,
  enHtml,
  bn,
}) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('lang') === 'bn')
      setLang('bn');
  }, []);

  function choose(next) {
    setLang(next);
    const url = new URL(window.location.href);
    if (next === 'bn') url.searchParams.set('lang', 'bn');
    else url.searchParams.delete('lang');
    window.history.replaceState(null, '', url);
  }

  const bnMinutes = new Intl.NumberFormat('bn-BD').format(minutes);
  const isBn = lang === 'bn';

  return (
    <div lang={isBn ? 'bn' : 'en'} className={isBn ? styles.bnWrap : undefined}>
      <div className={styles.langSwitch} role="group" aria-label="Language">
        <button
          type="button"
          aria-pressed={!isBn}
          className={!isBn ? styles.langOn : ''}
          onClick={() => choose('en')}
        >
          English
        </button>
        <button
          type="button"
          aria-pressed={isBn}
          className={isBn ? styles.langOn : ''}
          onClick={() => choose('bn')}
        >
          বাংলা
        </button>
      </div>

      <h1>{isBn ? bn.title || title : title}</h1>
      <p className={styles.meta}>
        {dateText} · {isBn ? `${bnMinutes} মিনিট পড়া` : `${minutes} min read`}
      </p>
      {cover && <img className={styles.postCover} src={cover} alt="" />}

      {/* Dutoi HTML server e sanitize kora. EN default, tai SEO te EN thake */}
      <div
        className={styles.prose}
        hidden={isBn}
        dangerouslySetInnerHTML={{ __html: enHtml }}
      />
      <div
        className={styles.prose}
        hidden={!isBn}
        lang="bn"
        dangerouslySetInnerHTML={{ __html: bn.html || enHtml }}
      />
    </div>
  );
}
