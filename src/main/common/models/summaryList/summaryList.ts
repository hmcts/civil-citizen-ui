import {t} from 'i18next';
import {getLanguage} from 'modules/i18n/languageService';

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

export function summaryRow(key?: any, value?: string, href?: string, hrefText?: string): SummaryRow {
  const langObj = {
    lng: getLanguage(),
  };
  const titleValue = t(key.text ? key.text : key, {...langObj, ...key.variables} as object);
  const row: SummaryRow = {
    key: {
      text: titleValue,
    },
    value: {
      html: t(value, langObj),
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

export interface TableCell {
  text: string
}

export function converToSummaryCard(value: string) {
  const langObj = {
    lng: getLanguage(),
  };
  return {
    title: {
      text: t(value, langObj),
    },
  };
}
