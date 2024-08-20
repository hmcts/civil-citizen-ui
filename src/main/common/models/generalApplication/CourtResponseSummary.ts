import { SummaryList, SummaryRow } from '../summaryList/summaryList';

export class CourtResponseSummaryList implements SummaryList {
  rows: SummaryRow[];
  responseButton? : ResponseButton;
  constructor(rows: SummaryRow[], responseButton? : ResponseButton) {
    this.rows = rows;
    this.responseButton = responseButton;
  }
}

export class ResponseButton {
  title: string;
  href: string;
  constructor(title: string, href : string) {
    this.title = title;
    this.href = href;
  }
}

