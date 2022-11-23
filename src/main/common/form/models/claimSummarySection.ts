import {SummaryRow, TableCell} from 'common/models/summaryList/summaryList';

export interface ClaimSummaryContent {
  contentSections?: ClaimSummarySection[];
  hasDivider?: boolean | true;
}

export interface ClaimSummarySection {
  type?: ClaimSummaryType;
  data?: ClaimSummaryItem;
}

export interface ClaimSummaryItem {
  text?: string;
  href?: string;
  classes?: string;
  link?: string;
  textBefore?: string;
  textAfter?: string;
  html?: string;
  subtitle?: string;
  rows?: SummaryRow[];
  variables?: any;
  head?: TableCell[];
  tableRows?: TableCell[][];
}

/**
 * NOTE:
 * Type determines what data properties needs that item
 */
export enum ClaimSummaryType {
  PARAGRAPH = 'p',
  BUTTON = 'button',
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  LINK = 'link',
  HTML = 'html',
  INSET_TEXT = 'insetText',
  SUMMARY = 'summary',
  TABLE = 'table'
}
