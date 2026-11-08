'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './Toast.module.css';

/*
  Shared toast system (top center).

  const toast = useToast();
  toast.success('Saved');
  toast.error('Failed', { description: 'Try again.' });

  // loading -> result (same toast gets updated)
  const id = toast.loading('Sending…');
  toast.success('Sent', { id, description: 'Thanks!' });
*/

const ToastContext = createContext(null);

const DURATION = { success: 4000, error: 6500, info: 5000, loading: 0 };
const MAX_VISIBLE = 3;
const EXIT_MS = 220;
let counter = 0;

const noop = () => '';
const fallbackApi = {
  show: noop,
  success: noop,
  error: noop,
  info: noop,
  loading: noop,
  dismiss: noop,
};

function Icon({ type }) {
  if (type === 'loading') return <span className={styles.spinner} />;
  const paths = {
    success: <path d="m5 12.5 4.2 4.2L19 7" />,
    error: <path d="M12 7v6.5M12 17.2v.1" />,
    info: <path d="M12 11v6M12 7.3v.1" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type] || paths.info}
    </svg>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, type, title, description, duration, leaving, version } = toast;
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const timer = useRef(null);

  const resume = useCallback(() => {
    if (!duration || timer.current) return;
    startedAt.current = Date.now();
    timer.current = window.setTimeout(() => onDismiss(id), remaining.current);
  }, [duration, id, onDismiss]);

  const pause = useCallback(() => {
    if (!timer.current) return;
    window.clearTimeout(timer.current);
    timer.current = null;
    remaining.current = Math.max(
      800,
      remaining.current - (Date.now() - startedAt.current),
    );
  }, []);

  useEffect(() => {
    resume();
    return () => {
      window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [resume]);

  return (
    <div
      className={`${styles.toast} ${styles[type] || ''}`}
      role={type === 'error' ? 'alert' : 'status'}
      data-leaving={leaving ? 'true' : 'false'}
      data-updated={version > 0 ? 'true' : 'false'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <span className={styles.icon}>
        <Icon type={type} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.desc}>{description}</p> : null}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      </button>
      {duration ? (
        <span
          className={styles.bar}
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => {
    setToasts(list =>
      list.map(item => (item.id === id ? { ...item, leaving: true } : item)),
    );
    window.setTimeout(() => {
      setToasts(list => list.filter(item => item.id !== id || !item.leaving));
    }, EXIT_MS);
  }, []);

  const show = useCallback(
    ({ id, type = 'info', title, description, duration }) => {
      const toastId = id || `toast-${(counter += 1)}`;
      setToasts(list => {
        const next = {
          id: toastId,
          type,
          title,
          description,
          duration: duration ?? DURATION[type] ?? DURATION.info,
          leaving: false,
          version: 0,
        };
        const index = list.findIndex(item => item.id === toastId);
        if (index >= 0) {
          const copy = list.slice();
          copy[index] = { ...next, version: list[index].version + 1 };
          return copy;
        }
        return [...list, next].slice(-MAX_VISIBLE);
      });
      return toastId;
    },
    [],
  );

  const api = useMemo(() => {
    const make =
      type =>
      (title, options = {}) =>
        show({ ...options, type, title });
    return {
      show,
      dismiss,
      success: make('success'),
      error: make('error'),
      info: make('info'),
      loading: make('loading'),
    };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Notifications">
        {toasts.map(item => (
          <ToastItem
            key={`${item.id}:${item.version}`}
            toast={item}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || fallbackApi;
}
