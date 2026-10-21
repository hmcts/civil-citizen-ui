export function toNumberOrUndefined(value: string): number {
  const numberValue: number = Number.parseFloat(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}

export function toOptionalNumber(value?: string): number {
  return value === undefined || value === null || String(value).trim() === '' ? undefined : Number(value);
}

export function toNumberOrString(value: string): number | string {
  const numberValue: number = Number.parseFloat(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export function isDecimal(value: number) {
  return Number(value) === value && value % 1 !== 0;
}
