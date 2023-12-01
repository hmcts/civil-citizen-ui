import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {DashboardNotification} from './dashboardNotification';

export class NotificationBuilder {
  _content: ClaimSummarySection[] = [];
  _title: string;
  addTitle(title: string): this {
    this._title = title;
    return this;
  }

  addContent(items: ClaimSummarySection[]) {
    this._content.push(...items);
    return this;
  }
  build(): DashboardNotification  {
    return new DashboardNotification(this._title, this._content);
  }
}
