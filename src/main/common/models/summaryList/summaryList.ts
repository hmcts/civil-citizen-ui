export interface SummaryList {
  classes?: string;
  rows: SummaryRow[];
}

export interface SummaryRow {
  key: Key;
  value: Value;
  actions?: Actions;
}

export interface Key {
  text?: string;
  html?: string;
}

export interface Value {
  text?: string;
  html?: string;
}

interface Actions {
  classes?: string;
  items: Item[];
}

interface Item {
  href: string;
  visuallyHiddenText?: string;
  text?: string;
  html?: string;
}

export function summaryRow(key?: string, value?: string, href?: string, hrefText?: string): SummaryRow {
  const row: SummaryRow = {
    key: {
      text: key,
    },
    value: {
      html: value,
    },
  };
  if (href) {
    row.actions = {
      items: [
        {
          href: href,
          text: hrefText,
          visuallyHiddenText: ` ${key}`,
        },
      ],
    };
  }
  return row;
}

export interface TitledSummaryRowElement {
  title?: string,
  value?: string
}

export interface TableCell {
  text?: string,
  html?: string,
  classes?: string
}
