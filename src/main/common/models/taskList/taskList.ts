import {TaskItem} from './task';
import {TaskStatus, TaskStatusColor} from "models/taskList/TaskStatus";

export interface TaskList {
  title: string,
  tasks: TaskItem[]
}

export class TaskListBuilder {
  private taskList: TaskList;

  constructor(title: string) {
    this.taskList = { title, tasks: [] };
  }

  addTask(taskItem: TaskItem): TaskListBuilder {
    this.taskList.tasks.push(taskItem);
    return this;
  }

  build(): TaskList {
    return this.taskList;
  }
}

// Example usage
const taskList = new TaskListBuilder('My Task List')
  .addTask(new TaskItem('Task 1', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
  .addTask(new TaskItem('Task 2', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
  .build();

console.log(taskList);
