import {Claim} from "common/models/claim";
import {TaskStatus} from "common/models/taskList/TaskStatus";
import {TaskList} from "common/models/taskList/taskList";

export const getDashboardNotifications = (claim: Claim, lng: string) => {
  // TODO: this is a mock data
  return [
    {
      title: "You haven’t responded to this claim",
      text: "You need to respond before 4pm on 9 October 2023 (6 days remaining).",
      linkText: "Respond to claim.",
      link: "#.",
    },
    {
      title: "Wait for the defendant to respond",
      text: "Mr Mary Richardshas until 4 October 2023 to respond. They can request up to an extra 28 days if they need it.",
    },
  ];
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
      title: "The claim",
      tasks: [
        {
          description: "View the claim",
          url: "#",
          status: TaskStatus.IN_PROGRESS,
          statusColor: getStatusColor(TaskStatus.IN_PROGRESS),
        },
        {
          description: "View information about the claimant",
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
