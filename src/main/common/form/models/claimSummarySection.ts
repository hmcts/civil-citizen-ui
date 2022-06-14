import {SummaryRow} from '../../../common/models/summaryList/summaryList';

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
}

/**
 * NOTE:
 * Type determines what data properties needs that item
 * The comments shows what properties we could use for each type
 */
export enum ClaimSummaryType {
  PARAGRAPH = 'p', // [text]
  BUTTON = 'button', // [href, text, classes]
  TITLE = 'title', // [text]
  SUBTITLE = 'subtitle', // [text]
  LINK = 'link', // [textBefore, textAfter, href, text, subtitle]
  HTML = 'html', // [html]
  INSET_TEXT = 'insetText', // [text, html]
  SUMMARY = 'summary' // [rows]
}
