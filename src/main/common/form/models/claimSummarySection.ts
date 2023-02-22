import {SummaryRow, TableCell} from 'models/summaryList/summaryList';

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
export class LastUpdateSectionBuilder {
  private _title: ClaimSummarySection;
  private _sections: ClaimSummarySection[];

  constructor() {
    this._title = undefined;
    this._sections = undefined;
  }

  setTitle(value: ClaimSummarySection) {
    this._title = value;
    return this;
  }

  get title(): ClaimSummarySection {
    return this._title;
  }

  get sections(): ClaimSummarySection[] {
    return this._sections;
  }

  setSections(value: ClaimSummarySection[]) {
    this._sections = value;
    return this;
  }
  build() {
    const claimSummarySections: ClaimSummarySection[] = [];
    claimSummarySections.push(this._title);
    this.sections.forEach((item) => {
      claimSummarySections.push(item);
    });
    return claimSummarySections;
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
