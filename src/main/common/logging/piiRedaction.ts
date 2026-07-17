const REDACTED = '[REDACTED]';
const BINARY_DATA = '[BINARY DATA]';
const EMAIL_PATTERN = /(?<![\w.+-])[\w.+-]+@[\w.-]+\.[a-z]{2,}(?![\w.-])/gi;
const SENSITIVE_FIELD_NAMES = [
  'firstName', 'lastName', 'fullName', 'partyName', 'individualFirstName', 'individualLastName',
  'soleTraderFirstName', 'soleTraderLastName', 'companyName', 'organisationName',
  'email', 'emailAddress', 'partyEmail', 'dateOfBirth', 'individualDateOfBirth', 'dob',
  'amount', 'admittedAmount', 'calculatedAmountInPence', 'claimAmount', 'claimFee', 'claimFeeInPence',
  'defendantAdmittedAmount', 'feeAmount', 'instalmentAmount', 'interest', 'interestAmount',
  'outstandingAmount', 'paidAmount', 'partialAmount', 'paymentAmount', 'paymentReference', 'paymentDate',
  'repaymentAmount', 'totalClaimAmount',
  'address', 'primaryAddress', 'addressLine[1-3]?', 'postCode', 'postTown', 'county', 'country',
].join('|');
const SENSITIVE_FIELD_PATTERN = new RegExp(`(?<![\\w])("?(?:${SENSITIVE_FIELD_NAMES})"?\\s*[:=]\\s*)("[^"]*"|[^,})\\r\\n]+)`, 'gi');
const SENSITIVE_KEYS = new RegExp(`^(?:${SENSITIVE_FIELD_NAMES})$`, 'i');
const LOG_METHODS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'] as const;
const WRAPPED_LOGGER = Symbol('piiRedactionWrapped');

type LogMethod = typeof LOG_METHODS[number];
type LoggerInstance = Record<LogMethod, (...args: unknown[]) => unknown> & {
  [WRAPPED_LOGGER]?: boolean;
};

export const redactString = (value: string): string => {
  const fieldsRedacted = value.replace(SENSITIVE_FIELD_PATTERN, `$1${REDACTED}`);
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
  try {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: redactString(value.message),
        stack: value.stack ? redactString(value.stack) : value.stack,
      };
    }
    if (Buffer.isBuffer(value)) {
      return BINARY_DATA;
    }
    if (value instanceof Date || value instanceof RegExp) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(item => redactLogValue(item, seen));
    }

    return Object.entries(value).reduce<Record<string, unknown>>((redacted, [key, entry]) => {
      redacted[key] = SENSITIVE_KEYS.test(key) ? REDACTED : redactLogValue(entry, seen);
      return redacted;
    }, {});
  } finally {
    seen.delete(value);
  }
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
