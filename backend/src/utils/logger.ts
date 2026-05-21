/* Minimal structured logger — keeps app dependency-free while remaining replaceable. */

type Level = 'info' | 'warn' | 'error' | 'debug';

function emit(level: Level, msg: unknown, extra?: unknown): void {
  const time = new Date().toISOString();
  const payload = extra === undefined ? '' : ` ${JSON.stringify(extra)}`;
  const text = `[${time}] [${level.toUpperCase()}] ${typeof msg === 'string' ? msg : JSON.stringify(msg)}${payload}`;
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(text);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(text);
  } else {
    // eslint-disable-next-line no-console
    console.log(text);
  }
}

export const logger = {
  info: (msg: unknown, extra?: unknown) => emit('info', msg, extra),
  warn: (msg: unknown, extra?: unknown) => emit('warn', msg, extra),
  error: (msg: unknown, extra?: unknown) => emit('error', msg, extra),
  debug: (msg: unknown, extra?: unknown) => {
    if (process.env.NODE_ENV !== 'production') emit('debug', msg, extra);
  },
};
