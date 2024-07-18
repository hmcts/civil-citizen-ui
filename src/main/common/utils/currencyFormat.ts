const formatter = new Intl.NumberFormat('en-UK',
  {
    style: 'currency',
    currency: 'GBP',
  });

const noGroupingFormatter = new Intl.NumberFormat('en-UK',
  {
    style: 'currency',
    currency: 'GBP',
    useGrouping: false,
  });

export default function currencyFormat(amount: number): string {
  return formatter.format(amount);
}

export function currencyFormatWithNoTrailingZeros(amount: number): string {
  return currencyFormat(amount).replace(/(\.00+)$/, '');
}

export function convertToPoundsFilter(value: number | string): number {
  return Number(value) / 100;
}

export function noGroupingCurrencyFormat(amount: number): string {
  return noGroupingFormatter.format(amount);
}

export function noGroupingCurrencyFormatWithNoTrailingZeros(amount: number): string {
  return noGroupingCurrencyFormat(amount).replace(/(\.00+)$/, '');
}

