import {DashboardNotification} from 'models/dashboard/dashboardNotification';

export class Notifications {
  items: DashboardNotification[];

  constructor(items: DashboardNotification[]) {
    this.items = items;
  }
}
