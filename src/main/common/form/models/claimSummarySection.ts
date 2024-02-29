import {SummaryRow, TableCell} from '../../../common/models/summaryList/summaryList';

export interface ClaimSummaryContent {
  contentSections?: ClaimSummarySection[];
  hasDivider?: boolean ;
}

export interface ClaimSummarySection {
  type?: ClaimSummaryType;
  data?: ClaimSummaryItem;
}

export interface ClaimSummaryItem {
  id?: string;
  name?: string;
  hint?: string;
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
  title?: string;
  externalLink?: boolean;
}

/**
 * NOTE:
 * Type determines what data properties needs that item
 */
export enum ClaimSummaryType {
  PARAGRAPH = 'p',
  LEAD_PARAGRAPH = 'leadParagraph',
  BUTTON = 'button',
  MAINTITLE = 'mainTitle',
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  LINK = 'link',
  HTML = 'html',
  INSET_TEXT = 'insetText',
  SUMMARY = 'summary',
  TABLE = 'table',
  PANEL = 'panel',
  WARNING = 'warning',
  INPUT = 'input',
  DATE = 'date',
  UPLOAD = 'upload',
  INPUT_ARRAY = 'inputArray',
  DATE_ARRAY = 'dateArray',
  UPLOAD_ARRAY = 'uploadArray',
  SELECT = 'select',
  BUTTON_WITH_CANCEL_LINK = 'buttonWithCancelLink',
  NEW_TAB_BUTTON = 'newTabButton',
  MICRO_TEXT = 'microText',
  SPAN = 'span',
  REMOVE_BUTTON = 'removeButton',
}
