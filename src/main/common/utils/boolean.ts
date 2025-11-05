const TRUE_LITERALS = new Set(['true', 't', 'yes', 'y', 'on', '1']);
const FALSE_LITERALS = new Set(['false', 'f', 'no', 'n', 'off', '0']);

export type BooleanLike = boolean | number | string;

const normalise = (value: string): string => value.trim().toLowerCase();

export const isBooleanable = (value: unknown): value is BooleanLike => {
  if (typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return value === 0 || value === 1;
  }

  if (typeof value === 'string') {
    const candidate = normalise(value);
    return TRUE_LITERALS.has(candidate) || FALSE_LITERALS.has(candidate);
  }

  return false;
};

export const boolean = (value: BooleanLike): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 0) {
      return false;
    }

    if (value === 1) {
      return true;
    }
  }

  if (typeof value === 'string') {
    const candidate = normalise(value);

    if (TRUE_LITERALS.has(candidate)) {
      return true;
    }

    if (FALSE_LITERALS.has(candidate)) {
      return false;
    }
  }

  throw new TypeError('Value is not boolean-like');
};
