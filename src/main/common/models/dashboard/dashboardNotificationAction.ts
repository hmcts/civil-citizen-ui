
export class DashboardNotificationAction {
  id: number;

  reference: string;

  actionPerformed: string;

  createdBy: string;

  createdAt: Date;

  constructor(id: number, reference: string, actionPerformed: string, createdBy: string, createdAt: string) {
    this.id = id;
    this.reference = reference;
    this.actionPerformed = actionPerformed;
    this.createdBy = createdBy;
    this.createdAt = new Date(createdAt);
  }
}
