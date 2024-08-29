import { SummaryList, SummaryRow } from '../summaryList/summaryList';

export class CourtResponseSummaryList implements SummaryList {
  rows: SummaryRow[];
  responseDateTime? :  Date;
  responseButton? : ResponseButton;
  constructor(rows: SummaryRow[], responseDateTime? : Date, responseButton? : ResponseButton) {
    this.rows = rows;
    this.responseButton = responseButton;
    this.responseDateTime = responseDateTime;
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

