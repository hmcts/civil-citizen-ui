import { Claim } from "common/models/claim";
import { TaskStatus } from "common/models/taskList/TaskStatus";
import { TaskList } from "common/models/taskList/taskList";
import { constructResponseUrlWithIdParams } from "common/utils/urlFormatter";
import { CLAIM_RESOLVING_DISPUTE_URL } from "routes/urls";
import { t } from "i18next";
import { getTaskLists } from "services/features/claim/taskListService";

jest.mock("../../../../../main/modules/i18n");
jest.mock("i18next", () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe("Response Task List service", () => {
  const userId = "123";
  const lng = "en";

  const expectedTaskConsiderOptions: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [
      {
        description: t("PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS", {lng}),
        url: constructResponseUrlWithIdParams(userId, CLAIM_RESOLVING_DISPUTE_URL),
        status: TaskStatus.INCOMPLETE,
      },
    ],
  };

  describe("TaskList service", () => {

    it("should return incompleted task list", () => {
      //Given
      const caseData = new Claim();
      const expectedTaskList: TaskList[] = [expectedTaskConsiderOptions];
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expect(taskList).toMatchObject(expectedTaskList);
    });
    it("should return completed task list", () => {
      //Given
      const caseData = new Claim();
      caseData.resolvingDispute = true;
      expectedTaskConsiderOptions.tasks[0].status = TaskStatus.COMPLETE;
      const expectedTaskList: TaskList[] = [expectedTaskConsiderOptions];
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expect(taskList).toMatchObject(expectedTaskList);
    });

  });

});
