import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  const dsn = import.meta.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('SENTRY_DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing(),
      // Replay integration removed for compatibility
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
