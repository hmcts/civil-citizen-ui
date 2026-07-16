const REDACTED = '[REDACTED]';
const EMAIL_PATTERN = /(?<![\w.+-])[\w.+-]+@[\w.-]+\.[a-z]{2,}(?![\w.-])/gi;
const PII_FIELD_PATTERN = /("?(?:firstName|lastName|fullName|partyName|individualFirstName|individualLastName|email|emailAddress|dateOfBirth|dob|addressLine[1-3]?|postCode|postcode|postTown|county|country)"?\s*[:=]\s*)("[^"]*"|[^,})]+)/gi;
const PII_KEYS = /^(?:firstName|lastName|fullName|partyName|individualFirstName|individualLastName|email|emailAddress|dateOfBirth|dob|address|addressLine[1-3]?|postCode|postcode|postTown|county|country)$/i;
const LOG_METHODS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'] as const;
const WRAPPED_LOGGER = Symbol('piiRedactionWrapped');

type LogMethod = typeof LOG_METHODS[number];
type LoggerInstance = Record<LogMethod, (...args: unknown[]) => unknown> & {
  [WRAPPED_LOGGER]?: boolean;
};

export const redactString = (value: string): string => {
  const fieldsRedacted = value.replace(PII_FIELD_PATTERN, `$1${REDACTED}`);
  return fieldsRedacted.replace(EMAIL_PATTERN, REDACTED);
};

export const redactLogValue = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (typeof value === 'string') {
    return redactString(value);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return '[CIRCULAR]';
  }
  seen.add(value);

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      stack: value.stack ? redactString(value.stack) : value.stack,
    };
  }
  if (Array.isArray(value)) {
    return value.map(item => redactLogValue(item, seen));
  }

  return Object.entries(value).reduce<Record<string, unknown>>((redacted, [key, entry]) => {
    redacted[key] = PII_KEYS.test(key) ? REDACTED : redactLogValue(entry, seen);
    return redacted;
  }, {});
};

const wrapLogger = (logger: LoggerInstance): LoggerInstance => {
  if (logger[WRAPPED_LOGGER]) {
    return logger;
  }
  LOG_METHODS.forEach(method => {
    const original = logger[method].bind(logger);
    logger[method] = (...args: unknown[]) => original(...args.map(argument => redactLogValue(argument)));
  });
  logger[WRAPPED_LOGGER] = true;
  return logger;
};

let installed = false;

export const installPiiLoggingRedaction = (): void => {
  if (installed) {
    return;
  }
  const {Logger} = require('@hmcts/nodejs-logging');
  const getLogger = Logger.getLogger.bind(Logger);
  Logger.getLogger = (name: string): LoggerInstance => wrapLogger(getLogger(name));
  installed = true;
};
