
import { Claim } from 'common/models/claim';
import {TaskStatus, TaskStatusColor} from 'common/models/taskList/TaskStatus';
import {TaskList, TaskListBuilder} from 'common/models/taskList/taskList';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {NotificationBuilder} from 'common/utils/NotificationBuilder';
import {TaskItem} from "models/taskList/task";

export const getDefendantNotifications = (claim: Claim, lng: string) => {
  const dashboardNotificationsList = [];

  dashboardNotificationsList.push(new NotificationBuilder()
    .addTitle('title1')
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 1')
      .addParagraph('paragraph1')
      .build())
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 2')
      .addParagraph('paragraph2')
      .build())
    .build());

  dashboardNotificationsList.push(new NotificationBuilder()
    .addTitle('title2')
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 1')
      .addParagraph('paragraph1')
      .build())
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 2')
      .addParagraph('paragraph2')
      .build())
    .build());
  return dashboardNotificationsList;

};
export const getClaimantNotifications = (claim: Claim, lng: string) => {
  const dashboardNotificationsList = [];
  dashboardNotificationsList.push(new NotificationBuilder()
    .addTitle('title1')
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 1')
      .addParagraph('paragraph1')
      .build())
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 2')
      .addParagraph('paragraph2')
      .build())
    .build());

  dashboardNotificationsList.push(new NotificationBuilder()
    .addTitle('title1')
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 1')
      .addParagraph('paragraph1')
      .build())
    .addContent(new PageSectionBuilder()
      .addTitle('Content title notification 2')
      .addParagraph('paragraph2')
      .build())
    .build());
  return dashboardNotificationsList;

};

export const getDashboardTaskList = (claim: Claim, lng: string): TaskList[] => {
  // TODO: this is a mock data
  const taskListMock: TaskList[]= [];
  const taskListItemMock =  new TaskListBuilder('The claim')
    .addTask(new TaskItem('Task 1', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .addTask(new TaskItem('Task 2', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .addTask(new TaskItem('Task 3', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .build();
  taskListMock.push(taskListItemMock);

  const taskListItemMock2 =  new TaskListBuilder('The claim')
    .addTask(new TaskItem('Task 1', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .addTask(new TaskItem('Task 2', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .addTask(new TaskItem('Task 3', 'http://example.com',TaskStatus.COMPLETE, true, TaskStatusColor[TaskStatus.COMPLETE]) )
    .build();
  taskListMock.push(taskListItemMock2);
  /*const taskListMock: TaskList[] = [
    {
      title: 'The claim',
      tasks: [
        {
          description: 'View the claim',
          url: '#',
          status: TaskStatus.DONE,
          statusColor: TaskStatusColor[TaskStatus.DONE],
        },
        {
          description: 'View information about the claimant',
          url: '#',
          status: TaskStatus.NOT_AVAILABLE_YET,
          statusColor: TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET],
        },
      ],
    },
    {
      title: 'The response',
      tasks: [
        {
          description: 'View the response to the claim',
          url: '#',
          status: TaskStatus.IN_PROGRESS,
          statusColor: TaskStatusColor[TaskStatus.IN_PROGRESS],
        },
        {
          description: 'View information about the defendant',
          url: '#',
          status: TaskStatus.READY_TO_VIEW,
          statusColor: TaskStatusColor[TaskStatus.READY_TO_VIEW],
        },
      ],
    },
  ];*/
  return taskListMock;
};
