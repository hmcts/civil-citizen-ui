export interface SummaryList {
  classes?: string;
  rows: SummaryRow[];
}

export interface SummaryRow {
  key: Key;
  value: Value;
  actions?: Actions;
  classes?: string;
}

export interface SummaryCard {
  card: CardTitle;
  rows: SummaryRow[];
}

export interface CardTitle {
  title: CardTitleText;
}

export interface CardTitleText {
  text: string;
}

export interface Key {
  text?: string;
  html?: string;
  classes?: string;
}

export interface Value {
  text?: string;
  html?: string;
  classes?: string;
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

export function summaryRow(key?: string, value?: string, href?: string, hrefText?: string, hiddentText?: string): SummaryRow {
  const row: SummaryRow = {
    key: {
      text: key,
    },
    value: {
      html: value,
    },
  };
  if (href) {
    const accessibilityText = hiddentText ? `${key} (${hiddentText})` : `${key}`;
    row.actions = {
      items: [
        {
          href: href,
          text: hrefText,
          visuallyHiddenText: accessibilityText,
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

export const CSS_CLASS_SUMMARY_LIST_KEY = 'govuk-summary-list__key';
