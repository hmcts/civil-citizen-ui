import { CaseState } from "common/form/models/claimDetails";
import { Claim } from "common/models/claim";
import { TaskStatus } from "common/models/taskList/TaskStatus";
import { TaskList } from "common/models/taskList/taskList";
import { t } from "i18next";
import { buildResponseToClaimSection } from "services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder";

export const buildClaimantNotifications = (claim: Claim, lng: string) => {

  // const dashboardNotificationsList = [];
  const notificationContent = buildResponseToClaimSection(claim, claim.id, lng)
  
  console.log(notificationContent);

    // const notificationContent: ClaimSummarySection[] = [{
  //   type: ClaimSummaryType.PARAGRAPH,
  //   data: {
  //     text: t("PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND", { lng, defendantName, responseDeadline }),
  //   },
  // },
  // {
  //   type: ClaimSummaryType.LINK,
  //   data: {
  //     text: 'View Claim',
  //     href: '#',
  //     textBefore:  t("PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND", { lng, defendantName, responseDeadline }),
  //   },
  // }];
  
  // const waitForDefendantResponseNotification = {
  //   title: t("PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND", { lng }),
  //   content: notificationContent,
  // };

  // dashboardNotificationsList.push(waitForDefendantResponseNotification);
  
  return notificationContent;
};

// export const buildClaimantNotifications = (claim: Claim, lng: string) => {
//   const dashboardNotificationsList = [];
//   const defendantName = claim.getDefendantFullName();
//   const responseDeadline = claim.formattedResponseDeadline();

//   const waitForDefendantResponseNotification = {
//     title: t("PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND", { lng }),
//     text: t("PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND", { lng, defendantName, responseDeadline }),
//   };

//   dashboardNotificationsList.push(waitForDefendantResponseNotification);
  
//   return dashboardNotificationsList;
// };

export const buildDefendantNotifications = (claim: Claim, lng: string) => {
  const dashboardNotificationsList = [];
  const responseDeadline = claim.formattedResponseDeadline();
  const remainingDays = claim.getRemainingDays();

  const youHaventRespondedNotification = {
    title: t("PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM"),
    text: t("PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE",{ lng, responseDeadline, remainingDays }),
    linkText: t("BUTTONS.RESPOND_TO_CLAIM"),
    link: "#",
  };

  if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
    dashboardNotificationsList.push(youHaventRespondedNotification);
  }

  return dashboardNotificationsList;
};

export const getDashboardTaskList = (claim: Claim, lng: string): TaskList[] => {
  // TODO: this is a mock data
  const taskListMock: TaskList[] = [
    {
      title: "The claim",
      tasks: [
        {
          description: "View the claim",
          url: "#",
          status: TaskStatus.DONE,
          statusColor: getStatusColor(TaskStatus.DONE),
        },
        {
          description: "View information about the claimant",
          url: "#",
          status: TaskStatus.NOT_AVAILABLE_YET,
          statusColor: getStatusColor(TaskStatus.NOT_AVAILABLE_YET),
        },
      ],
    },
    {
      title: "The response",
      tasks: [
        {
          description: "View the response to the claim",
          url: "#",
          status: TaskStatus.IN_PROGRESS,
          statusColor: getStatusColor(TaskStatus.IN_PROGRESS),
        },
        {
          description: "View information about the defendant",
          url: "#",
          status: TaskStatus.READY_TO_VIEW,
          statusColor: getStatusColor(TaskStatus.READY_TO_VIEW),
        },
      ],
    },
  ];
  return taskListMock;
};

const getStatusColor = (taskStatus: TaskStatus): string => {
  const grey = "govuk-tag--grey";
  const red = "govuk-tag--red";
  const green = "govuk-tag--green";
  const yellow = "govuk-tag--yellow";

  switch (taskStatus) {
    case TaskStatus.DONE:
      return green;
    case TaskStatus.IN_PROGRESS:
      return yellow;
    case TaskStatus.NOT_AVAILABLE_YET:
      return grey;
    case TaskStatus.READY_TO_VIEW:
      return red;
    default:
      return grey;
  }
};
