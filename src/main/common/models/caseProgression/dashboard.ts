import {TaskList} from 'models/taskList/taskList';

export class Dashboard {
  items: TaskList[];

  constructor(items: TaskList[]) {
    this.items = items;
  }
}

export class NotificationItem {
  type: string;

  constructor(type: string) {
    this.type = type;
  }
}
