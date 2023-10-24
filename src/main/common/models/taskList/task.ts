import {TaskStatus} from './TaskStatus';

export interface Task {
  description: string,
  url: string,
  status: TaskStatus,
  isCheckTask?: boolean;
}
