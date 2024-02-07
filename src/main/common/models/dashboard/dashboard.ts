import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';

export class Dashboard {
  items: DashboardTaskList[];

  constructor(items: DashboardTaskList[]) {
    this.items = items;
  }
}
