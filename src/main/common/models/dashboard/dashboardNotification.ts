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

  constructor(id: string, titleEn: string, titleCy:string, descriptionEn: string,
    descriptionCy: string, timeToLive: string,
    notificationAction: DashboardNotificationAction, params: Map<string, object>) {
    this.id = id;
    this.titleEn = titleEn;
    this.titleCy = titleCy;
    this.descriptionEn = descriptionEn;
    this.descriptionCy = descriptionCy;
    this.timeToLive = timeToLive;
    this.notificationAction = notificationAction;
    this.params = params;
  }
}
