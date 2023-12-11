import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {DashboardNotification} from './dashboardNotification';

export class NotificationBuilder {
  private dashboardNotification: DashboardNotification;
  constructor(title: string) {
    this.dashboardNotification = { title, content: [] };
  }

  addContent(items: ClaimSummarySection[]) {
    this.dashboardNotification.content.push(...items);
    return this;
  }
  build(): DashboardNotification  {
    return this.dashboardNotification;
  }
}
