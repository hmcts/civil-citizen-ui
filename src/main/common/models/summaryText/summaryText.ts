import {ClaimSummarySection} from 'form/models/claimSummarySection';

export class SummaryText {
  title : string;
  html : ClaimSummarySection[];

  constructor(title: string, html: ClaimSummarySection[]) {
    this.title = title;
    this.html = html;
  }
}
