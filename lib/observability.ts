type LogContext = Record<string, unknown>;

export function logInfo(message: string, context?: LogContext) {
  if (__DEV__) {
    console.info(`[LUVLOTS] ${message}`, context ?? '');
  }
}

export function logError(error: unknown, context?: LogContext) {
  if (__DEV__) {
    console.error('[LUVLOTS]', error, context ?? '');
  }

  // Sentry can be wired here once EXPO_PUBLIC_SENTRY_DSN is configured and
  // @sentry/react-native is added during the production monitoring pass.
}
