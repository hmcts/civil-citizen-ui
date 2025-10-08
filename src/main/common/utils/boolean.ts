const TRUE_LITERALS = new Set(['true', '1', 'yes', 'y', 'on', 't']);
const FALSE_LITERALS = new Set(['false', '0', 'no', 'n', 'off', 'f']);

type BooleanLike = boolean | string | number;

const normalise = (value: string): string => value.trim().toLowerCase();

export const isBooleanLike = (value: unknown): value is BooleanLike => {
  if (typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'number') {
    return value === 0 || value === 1;
  }
  if (typeof value === 'string') {
    const normalised = normalise(value);
    return TRUE_LITERALS.has(normalised) || FALSE_LITERALS.has(normalised);
  }
  return false;
};

export const toBoolean = (value: BooleanLike): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  const normalised = normalise(value);
  if (TRUE_LITERALS.has(normalised)) {
    return true;
  }
  if (FALSE_LITERALS.has(normalised)) {
    return false;
  }
  throw new TypeError('Value is not boolean-like.');
};

export const parseBoolean = (value: unknown): boolean | undefined => {
  if (!isBooleanLike(value)) {
    return undefined;
  }
  return toBoolean(value);
};
