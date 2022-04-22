import {TaskStatus} from "../common/form/models/TaskStatus";
import {TaskList} from "../common/form/models/taskList";

/**
 * THIS FILE IS A CONCEPT
 * 
 * This code is only a concept of what we should do. 
 * 
 */

let data: TaskList[] = [];
let completed = 0;
let total = 0;

const calculateTotalAndCompleted = (tasksLists: TaskList[]) => {
  data = [];
  completed = 0;
  total = 0;
  tasksLists.forEach(tasksList => {
    total += tasksList.tasks.length;
    data.push(tasksList);
  });

  data.forEach(taskList => {
    completed += countCompletedTasks(taskList);
  });
}

const getTitle = (tasksLists: TaskList[]) => {
  calculateTotalAndCompleted(tasksLists);
  return completed < total ? 'Application incomplete' : 'Application complete';
}

const getDescription = (tasksLists: TaskList[]) => {
  calculateTotalAndCompleted(tasksLists);
  return `You have completed ${completed} of ${total} sections`;
}

const countCompletedTasks = (taskList: TaskList) => {
  return taskList.tasks.filter(task => task.status === TaskStatus.COMPLETE).length;
}

export { getTitle, getDescription };
