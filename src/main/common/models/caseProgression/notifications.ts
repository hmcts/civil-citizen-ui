import {DashboardNotification} from 'common/utils/dashboard/dashboardNotification';

export class Notifications {
  items: DashboardNotification[];

  constructor(items: DashboardNotification[]) {
    this.items = items;
  }
}
