import {DashboardNotificationAction} from 'models/dashboard/dashboardNotificationAction';

export class DashboardNotification {
  id: string;
  titleEn: string;
  titleCy: string;
  descriptionEn: string;
  descriptionCy: string;
  timeToLive: string;
  notificationAction: DashboardNotificationAction;
  params: Map<string, object>;
  createdAt: string;
  deadline: string;

  constructor(id: string, titleEn: string, titleCy:string, descriptionEn: string,
    descriptionCy: string, timeToLive: string,
    notificationAction: DashboardNotificationAction, params: Map<string, object>,
    createdAt: string, deadline: string) {
    this.id = id;
    this.titleEn = titleEn;
    this.titleCy = titleCy;
    this.descriptionEn = descriptionEn;
    this.descriptionCy = descriptionCy;
    this.timeToLive = timeToLive;
    this.notificationAction = notificationAction;
    this.params = params;
    this.createdAt = createdAt;
    this.deadline = deadline;
  }
}
