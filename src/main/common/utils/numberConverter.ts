function toNumberOrUndefined(value: string): number {
  const numberValue: number = parseFloat(value);
  return isNaN(numberValue) ? undefined : numberValue;
}

export {
  toNumberOrUndefined,
};
