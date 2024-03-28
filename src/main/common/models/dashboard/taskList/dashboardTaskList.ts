import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';

export class DashboardTaskList {
  categoryEn: string;
  categoryCy: string;
  tasks: DashboardTask[];

  constructor(categoryEn: string, categoryCy: string, tasks?: DashboardTask[]) {
    this.categoryEn = categoryEn;
    this.categoryCy = categoryCy;
    this.tasks = tasks ? tasks : [];
  }
}
