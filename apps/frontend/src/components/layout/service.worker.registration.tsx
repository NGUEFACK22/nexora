'use client';
import { FC, useEffect } from 'react';

// registers the PWA service worker in production only — in dev the worker
// would cache HMR chunks and break hot reloads
export const ServiceWorkerRegistration: FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // a failed registration must never break the app: the site
        // simply runs without offline support
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
};
