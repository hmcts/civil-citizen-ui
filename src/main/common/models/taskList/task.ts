import {TaskStatus} from './TaskStatus';

export interface Task {
  description: string,
  url?: string,
  status: TaskStatus,
  isCheckTask?: boolean;
  statusColor?: string;
}

export class TaskItem implements Task {
  description: string;
  url?: string;
  status: TaskStatus;
  isCheckTask?: boolean;
  statusColor?: string;

  constructor(description: string, url: string, status: TaskStatus, isCheckTask?: boolean, statusColor?: string) {
    this.description = description;
    if (url !== undefined){
      this.url = url;
    }
    this.status = status;
    if (isCheckTask !== undefined) {
      this.isCheckTask = isCheckTask;
    }
    if (statusColor) {
      this.statusColor = statusColor;
    }
  }
}
