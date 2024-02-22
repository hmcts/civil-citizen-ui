import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';

export class CivilServiceDashboardTask {
  id: number;
  categoryEn: string;
  categoryCy: string;
  taskNameEn: string;
  taskNameCy: string;
  currentStatusEn: DashboardTaskStatus;
  currentStatusCy: string;
  hintTextEn: string;
  hintTextCy: string;
  url: string;
}

