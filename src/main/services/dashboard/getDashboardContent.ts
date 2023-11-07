import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {TaskStatus, TaskStatusColor} from 'common/models/taskList/TaskStatus';
import {TaskItem} from 'common/models/taskList/task';
import {TaskList} from 'common/models/taskList/taskList';
import {TaskListBuilder} from 'common/models/taskList/taskListBuilder';
import {NotificationBuilder} from 'common/utils/dashboard/notificationBuilder';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';

export const getClaimantNotifications = (claim: Claim, lng: string) => {

  const dashboardNotificationsList = [];
  const defendantName = claim.getDefendantFullName();
  const responseDeadline = claim.formattedResponseDeadline();

  // TODO: Call civil Service in order to retrieve Notifications.
  // TODO: this is a mock data
  const waitForDefendantResponseNotification = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();

  const waitForDefendantResponseNotification2 = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND', { lng }))
    .addContent(new PageSectionBuilder()
      .addLink('View Claim', '#', t('PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', { lng, defendantName, responseDeadline }))
      .build())
    .build();

  dashboardNotificationsList.push(waitForDefendantResponseNotification);
  dashboardNotificationsList.push(waitForDefendantResponseNotification2);

  return dashboardNotificationsList;
};

export const getDefendantNotifications = (claim: Claim, lng: string) => {
  // TODO: this is a mock data
  const dashboardNotificationsList = [];
  const responseDeadline = claim.formattedResponseDeadline();
  const remainingDays = claim.getRemainingDays();

  const youHaventRespondedNotification = new NotificationBuilder()
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM'))
    .addContent(new PageSectionBuilder()
      .addLink(t('BUTTONS.RESPOND_TO_CLAIM'), '#', t('PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE',{ lng, responseDeadline, remainingDays }))
      .build())
    .build();

  if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
    dashboardNotificationsList.push(youHaventRespondedNotification);
  }

  return dashboardNotificationsList;
};

export const getDashboardTaskList = (claim: Claim, lng: string): TaskList[] => {
  // TODO: this is a mock data
  const dashboard: TaskList[] = [];

  const hearings: TaskList = new TaskListBuilder(t('PAGES.DASHBOARD.HEARINGS.TITLE'))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_HEARINGS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.UPLOAD_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_DOCUMENTS'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])).build();
  if (claim.isClaimant() ) {
    hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.PAY_FEE'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
  }
  else if (claim.isFastTrackClaim){
    hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.ADD_TRIAL'), '#', TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));
  }
  hearings.tasks.push((new TaskItem(t('PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE'), '#',TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET])));

  const noticeAndOrders =  new TaskListBuilder(t('PAGES.DASHBOARD.ORDERS_NOTICE.TITLE'))
    .addTask(new TaskItem(t('PAGES.DASHBOARD.ORDERS_NOTICE.VIEW'), '#',TaskStatus.NOT_AVAILABLE_YET, false, TaskStatusColor[TaskStatus.NOT_AVAILABLE_YET]))
    .build();

  dashboard.push(hearings);
  dashboard.push(noticeAndOrders);

  return dashboard;
};
