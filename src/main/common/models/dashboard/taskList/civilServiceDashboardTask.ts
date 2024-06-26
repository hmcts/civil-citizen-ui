import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';

export class CivilServiceDashboardTask {
  id: string;
  categoryEn: string;
  categoryCy: string;
  taskNameEn: string;
  taskNameCy: string;
  currentStatusEn: DashboardTaskStatus;
  currentStatusCy: string;
  hintTextEn: string;
  hintTextCy: string;

  constructor(id: string, categoryEn: string, categoryCy: string, taskNameEn: string, taskNameCy: string,
    currentStatusEn: DashboardTaskStatus, currentStatusCy: string, hintTextEn: string, hintTextCy: string) {
    this.id = id;
    this.categoryEn = categoryEn;
    this.categoryCy = categoryCy;
    this.taskNameEn = taskNameEn;
    this.taskNameCy = taskNameCy;
    this.currentStatusEn = currentStatusEn;
    this.currentStatusCy = currentStatusCy;
    this.hintTextEn = hintTextEn;
    this. hintTextCy = hintTextCy;
  }
}

