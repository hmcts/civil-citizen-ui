import {SummaryRow, TableCell} from '../../../common/models/summaryList/summaryList';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from "routes/urls";

export interface ClaimSummaryContent {
  contentSections?: ClaimSummarySection[];
  hasDivider?: boolean | true;
}

export interface ClaimSummarySection {
  type?: ClaimSummaryType;
  data?: ClaimSummaryItem;
}
export interface Variables{
  name: string;
  value: string;
}
export class ClaimSummarySectionBuilder {
  _type: ClaimSummaryType;
  _text: string;
  _claimId: string;
  _variables: Variables[];
  constructor(type: ClaimSummaryType, text: string, claimId: string, variables?: Variables[]) {
    this._type = type;
    this._text = text;
    this._claimId = claimId;
    this._variables = variables;
  }

  getClaimSummarySection(): ClaimSummarySection {
    return (
      {
        type: this._type,
        data: {
          text: this._text,
          href: BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', this._claimId),
          variables: this._variables,
        },
      }
    );
  }
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
  title?: string;
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
  TABLE = 'table',
  PANEL = 'panel'
}
