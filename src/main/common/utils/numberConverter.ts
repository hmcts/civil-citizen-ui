export function toNumberOrUndefined(value: string): number {
  const numberValue: number = parseFloat(value);
  return isNaN(numberValue) ? undefined : numberValue;
}

export function toNumberOrString(value: string): number | string {
  const numberValue: number = parseFloat(value);
  return isNaN(numberValue) ? value : numberValue;
}

export function isDecimal(value: number) {
  return Number(value) === value && value % 1 !== 0;
}