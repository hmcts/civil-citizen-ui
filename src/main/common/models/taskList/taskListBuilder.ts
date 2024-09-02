import {Task} from './task';
import {TaskList} from './taskList';

export class TaskListBuilder {
  private taskList: TaskList;

  constructor(title: string) {
    this.taskList = { title, tasks: [] };
  }

  addTask(taskItem: Task): TaskListBuilder {
    this.taskList.tasks.push(taskItem);
    return this;
  }

  build(): TaskList {
    return this.taskList;
  }
}
