import {escapeHtml} from 'common/utils/escapeHtml';

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

export function summaryRow(key?: string, value?: string, href?: string, hrefText?: string, hiddenText?: string): SummaryRow {
  const row: SummaryRow = {
    key: {
      text: key,
    },
    value: {
      html: value == null ? value : escapeHtml(value),
    },
  };
  if (href) {
    const accessibilityText = hiddenText ? `${key} (${hiddenText})` : `${key}`;
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

/**
 * Builds a summary row whose value contains trusted HTML.
 *
 * Prefer summaryRow for all plain text, especially litigant-supplied content.
 * Any dynamic values interpolated into html must be escaped before calling this helper.
 */
export function summaryRowHtml(key?: string, html?: string, href?: string, hrefText?: string, hiddenText?: string): SummaryRow {
  const row: SummaryRow = {
    key: {text: key},
    value: {html},
  };
  if (href) {
    const accessibilityText = hiddenText ? `${key} (${hiddenText})` : `${key}`;
    row.actions = {
      items: [
        {href, text: hrefText, visuallyHiddenText: accessibilityText},
      ],
    };
  }
  return row;
}

/**
 * Sets the value using the GOV.UK text API. Prefer summaryRow for standard summary lists;
 * this variant remains useful to callers that read value.text directly.
 */
export function summaryRowWithTextValue(key?: string, value?: string, href?: string, hrefText?: string, hiddenText?: string): SummaryRow {
  const row: SummaryRow = {
    key: { text: key },
    value: { text: value },
  };
  if (href) {
    const accessibilityText = hiddenText ? `${key} (${hiddenText})` : `${key}`;
    row.actions = {
      items: [
        { href, text: hrefText, visuallyHiddenText: accessibilityText },
      ],
    };
  }
  return row;
}

export interface TitledSummaryRowElement {
  title?: string,
  value?: string,
  html?: string
}

export interface TableCell {
  text?: string,
  html?: string,
  classes?: string
}

export const CSS_CLASS_SUMMARY_LIST_KEY = 'govuk-summary-list__key';
