// FILE: adnanzeros/adnanzeros/src/app/blog/[slug]/ViewTracker.js  (NOTUN file)
'use client';

/* Counts one view per visitor session + how many seconds the tab was really visible. */
import { useEffect } from 'react';

export default function ViewTracker({ slug }) {
  useEffect(() => {
    const url = `/api/blog/${encodeURIComponent(slug)}/track`;
    const send = body =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});

    const key = `viewed:${slug}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        send({ type: 'view' });
      }
    } catch {
      send({ type: 'view' });
    }

    let active = 0;
    let since = document.visibilityState === 'visible' ? Date.now() : 0;
    const pause = () => {
      if (since) active += Date.now() - since;
      since = 0;
    };
    const flush = () => {
      pause();
      const seconds = Math.round(active / 1000);
      if (seconds >= 3) send({ type: 'time', seconds });
      active = 0;
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') since = Date.now();
      else flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [slug]);

  return null;
}
