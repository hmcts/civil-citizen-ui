export interface SummaryList {
  classes?: string;
  rows: SummaryRow[];
}

export interface SummaryRow {
  key: Key;
  value: Value;
  actions?: Actions;
}

type Key = { text: string } | { html: string }

type Value = { text: string } | { html: string }

type Actions = {
  classes?: string;
  items: Item[];
}

type Item = {
  href: string;
  visuallyHiddenText?: string;
} & ({ text: string } | { html: string })

export function summaryRow(key?: string, value?: string, href?: string, hrefText?: string): SummaryRow {
  const row: SummaryRow = {
    key: {
      text: key,
    },
    value: {
      text: value,
    },
  };
  if (href) {
    row.actions = {
      items: [
        {
          href: href,
          text: hrefText,
        },
      ],
    };
  }
  return row;
}
