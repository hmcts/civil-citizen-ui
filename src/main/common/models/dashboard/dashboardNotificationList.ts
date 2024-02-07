import {DashboardNotification} from 'models/dashboard/dashboardNotification';

export class DashboardNotificationList {
  items: DashboardNotification[];

  constructor(items: DashboardNotification[]) {
    this.items = items;
  }
}
