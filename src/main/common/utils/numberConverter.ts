export function toNumberOrUndefined(value: string): number {
  const numberValue: number = Number.parseFloat(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}

export function toNumberOrString(value: string): number | string {
  const numberValue: number = Number.parseFloat(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export function isDecimal(value: number) {
  return Number(value) === value && value % 1 !== 0;
}
