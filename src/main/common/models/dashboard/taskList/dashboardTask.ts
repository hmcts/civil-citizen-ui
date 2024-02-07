export interface DashboardTask {
  description: string
}

export class TaskItem implements DashboardTask {
  description: string;

  constructor(description: string) {
    this.description = description;
  }
}
