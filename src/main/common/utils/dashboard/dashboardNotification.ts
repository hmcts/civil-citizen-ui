import {ClaimSummarySection} from 'form/models/claimSummarySection';

export class DashboardNotification {
  title: string;
  content: ClaimSummarySection[];
  constructor(title: string, content: ClaimSummarySection[]) {
    this.title = title;
    this.content = content;
  }
}
