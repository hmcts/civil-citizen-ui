import {
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIM_AMOUNT_URL,
  CLAIM_CHECK_ANSWERS_URL,
  CLAIM_COMPLETING_CLAIM_URL,
  CLAIM_DEFENDANT_PARTY_TYPE_URL,
  CLAIM_REASON_URL,
  CLAIM_RESOLVING_DISPUTE_URL,
} from 'routes/urls';
import {
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {TaskList} from 'common/models/taskList/taskList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {t} from 'i18next';
import {getTaskLists} from 'services/features/claim/taskListService';
import {Party} from 'common/models/party';
import {PartyType} from 'common/models/partyType';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {YesNo} from 'common/form/models/yesNo';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {Reason} from 'common/form/models/claim/details/reason';
import {ClaimantTimeline} from 'common/form/models/timeLineOfEvents/claimantTimeline';
import {TimelineRow} from 'common/form/models/timeLineOfEvents/timelineRow';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {Interest} from 'common/form/models/interest/interest';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {TotalInterest} from 'common/form/models/interest/totalInterest';
import {InterestStartDate} from 'common/form/models/interest/interestStartDate';
import {outstandingTasksFromCase} from 'services/features/claim/taskListService';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const userId = '123';
const lng = 'en';

const expectedTaskConsiderOptions: TaskList = {
  title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
  tasks: [
    {
      description: t('PAGES.CLAIM_TASK_LIST.RESOLVING_DISPUTE', { lng }),
      url: constructResponseUrlWithIdParams(
        userId,
        CLAIM_RESOLVING_DISPUTE_URL,
      ),
      status: TaskStatus.INCOMPLETE,
    },
  ],
};

const expectedTaskPrepareClaim: TaskList = {
  title: t('PAGES.CLAIM_TASK_LIST.PREPARE_CLAIM'),
  tasks: [
    {
      description: t('PAGES.CLAIM_TASK_LIST.COMPLETING_CLAIM', { lng }),
      url: constructResponseUrlWithIdParams(userId, CLAIM_COMPLETING_CLAIM_URL),
      status: TaskStatus.INCOMPLETE,
    },
    {
      description: t('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', { lng }),
      url: constructResponseUrlWithIdParams(
        userId,
        CLAIMANT_PARTY_TYPE_SELECTION_URL,
      ),
      status: TaskStatus.INCOMPLETE,
    },
    {
      description: t('PAGES.CLAIM_TASK_LIST.THEIR_DETAILS', { lng }),
      url: constructResponseUrlWithIdParams(
        userId,
        CLAIM_DEFENDANT_PARTY_TYPE_URL,
      ),
      status: TaskStatus.INCOMPLETE,
    },
    {
      description: t('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', { lng }),
      url: constructResponseUrlWithIdParams(userId, CLAIM_AMOUNT_URL),
      status: TaskStatus.INCOMPLETE,
    },
    {
      description: t('PAGES.CLAIM_TASK_LIST.CLAIM_DETAILS', { lng }),
      url: constructResponseUrlWithIdParams(userId, CLAIM_REASON_URL),
      status: TaskStatus.INCOMPLETE,
    },
  ],
};

const expectedTaskSubmit: TaskList = {
  title: t('PAGES.CLAIM_TASK_LIST.SUBMIT'),
  tasks: [
    {
      description: t('PAGES.CLAIM_TASK_LIST.CHECK_AND_SUBMIT', { lng }),
      url: constructResponseUrlWithIdParams(userId, CLAIM_CHECK_ANSWERS_URL),
      status: TaskStatus.INCOMPLETE,
    },
  ],
};

describe('Claim Task List service', () => {
  describe('TaskList incomplete', () => {
    it('should return incompleted task list', () => {
      //Given
      const caseData = new Claim();
      const expectedTaskList: TaskList[] = [
        expectedTaskConsiderOptions,
        expectedTaskPrepareClaim,
        expectedTaskSubmit,
      ];
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expect(taskList).toMatchObject(expectedTaskList);
    });

    it('should return incompleted task list', () => {
      //Given
      const caseData = new Claim();
      //When
      const taskList = outstandingTasksFromCase(caseData, userId, lng);
      //Then
      expect(taskList).toHaveLength(7);
    });

  });
  describe('TaskList service Prepare your claim section', () => {
    it('should complete Prepare your claim section', () => {
      //Given
      const caseData = new Claim();
      caseData.completingClaimConfirmed = true;
      caseData.respondent1 = new Party();
      caseData.applicant1 = new Party();
      caseData.respondent1.type = PartyType.COMPANY;
      caseData.applicant1.type = PartyType.COMPANY;
      caseData.respondent1.partyDetails = new PartyDetailsCARM({
        partyName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.applicant1.partyDetails = new PartyDetailsCARM({
        partyName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.claimAmountBreakup = [
        { value: { claimAmount: 'string', claimReason: 'string' } },
      ];
      caseData.claimInterest = YesNo.NO;
      caseData.claimDetails = new ClaimDetails(
        new Reason('reason'),
        new ClaimantTimeline([new TimelineRow(1, 1, 2020, 'test')]),
        new HelpWithFees(YesNo.NO),
      );
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expectedTaskPrepareClaim.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[1].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[2].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[3].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[4].status = TaskStatus.COMPLETE;
      const expectedTaskList: TaskList[] = [
        expectedTaskConsiderOptions,
        expectedTaskPrepareClaim,
        expectedTaskSubmit,
      ];
      expect(taskList).toMatchObject(expectedTaskList);
    });

    it('should return completed task list when interest breakdown', () => {
      //Given
      const caseData = new Claim();
      caseData.resolvingDispute = true;
      caseData.completingClaimConfirmed = true;
      caseData.respondent1 = new Party();
      caseData.applicant1 = new Party();
      caseData.respondent1.type = PartyType.INDIVIDUAL;
      caseData.applicant1.type = PartyType.INDIVIDUAL;
      caseData.claimInterest = YesNo.YES;
      caseData.respondent1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.applicant1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.respondent1.dateOfBirth = new CitizenDate();
      caseData.applicant1.dateOfBirth = new CitizenDate();
      caseData.claimAmountBreakup = [
        { value: { claimAmount: 'string', claimReason: 'string' } },
      ];
      caseData.interest = new Interest();
      caseData.interest.interestClaimOptions =
        InterestClaimOptionsType.BREAK_DOWN_INTEREST;
      caseData.interest.totalInterest = new TotalInterest('100', 'test');

      caseData.claimDetails = new ClaimDetails(
        new Reason('reason'),
        new ClaimantTimeline([new TimelineRow(1, 1, 2020, 'test')]),
        new HelpWithFees(YesNo.NO),
      );
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expectedTaskConsiderOptions.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[1].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[2].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[3].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[4].status = TaskStatus.COMPLETE;
      const expectedTaskList: TaskList[] = [
        expectedTaskConsiderOptions,
        expectedTaskPrepareClaim,
        expectedTaskSubmit,
      ];
      expect(taskList).toMatchObject(expectedTaskList);
    });

    it('should return completed task list when interest same rate', () => {
      //Given
      const caseData = new Claim();
      caseData.resolvingDispute = true;
      caseData.completingClaimConfirmed = true;
      caseData.respondent1 = new Party();
      caseData.applicant1 = new Party();
      caseData.respondent1.type = PartyType.INDIVIDUAL;
      caseData.applicant1.type = PartyType.INDIVIDUAL;
      caseData.respondent1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.applicant1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.respondent1.dateOfBirth = new CitizenDate();
      caseData.applicant1.dateOfBirth = new CitizenDate();
      caseData.claimAmountBreakup = [
        { value: { claimAmount: 'string', claimReason: 'string' } },
      ];
      caseData.claimInterest = YesNo.YES;
      caseData.interest = new Interest();
      caseData.interest.interestClaimOptions =
        InterestClaimOptionsType.SAME_RATE_INTEREST;
      caseData.interest.sameRateInterestSelection = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
      };
      caseData.interest.interestClaimFrom =
        InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
      caseData.claimDetails = new ClaimDetails(
        new Reason('reason'),
        new ClaimantTimeline([new TimelineRow(1, 1, 2020, 'test')]),
        new HelpWithFees(YesNo.NO),
      );
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expectedTaskConsiderOptions.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[1].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[2].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[3].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[4].status = TaskStatus.COMPLETE;
      const expectedTaskList: TaskList[] = [
        expectedTaskConsiderOptions,
        expectedTaskPrepareClaim,
        expectedTaskSubmit,
      ];
      expect(taskList).toMatchObject(expectedTaskList);
    });

    it('should return completed task list when interest same rate and specific date', () => {
      //Given
      const caseData = new Claim();
      caseData.resolvingDispute = true;
      caseData.completingClaimConfirmed = true;
      caseData.respondent1 = new Party();
      caseData.applicant1 = new Party();
      caseData.respondent1.type = PartyType.INDIVIDUAL;
      caseData.applicant1.type = PartyType.INDIVIDUAL;
      caseData.respondent1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.applicant1.partyDetails = new PartyDetailsCARM({
        individualFirstName: 'Test Company',
        primaryAddress: 'test',
      });
      caseData.respondent1.dateOfBirth = new CitizenDate();
      caseData.applicant1.dateOfBirth = new CitizenDate();
      caseData.claimAmountBreakup = [
        { value: { claimAmount: 'string', claimReason: 'string' } },
      ];
      caseData.claimInterest = YesNo.YES;
      caseData.interest = new Interest();
      caseData.interest.interestClaimOptions =
        InterestClaimOptionsType.SAME_RATE_INTEREST;
      caseData.interest.sameRateInterestSelection = {
        sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
      };
      caseData.interest.interestClaimFrom =
        InterestClaimFromType.FROM_A_SPECIFIC_DATE;
      caseData.interest.interestStartDate = new InterestStartDate(
        '1',
        '1',
        '2020',
        'test',
      );
      caseData.interest.interestEndDate =
        InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;

      caseData.claimDetails = new ClaimDetails(
        new Reason('reason'),
        new ClaimantTimeline([new TimelineRow(1, 1, 2020, 'test')]),
        new HelpWithFees(YesNo.NO),
      );
      //When
      const taskList = getTaskLists(caseData, userId, lng);
      //Then
      expectedTaskConsiderOptions.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[0].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[1].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[2].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[3].status = TaskStatus.COMPLETE;
      expectedTaskPrepareClaim.tasks[4].status = TaskStatus.COMPLETE;
      const expectedTaskList: TaskList[] = [
        expectedTaskConsiderOptions,
        expectedTaskPrepareClaim,
        expectedTaskSubmit,
      ];
      expect(taskList).toMatchObject(expectedTaskList);
    });
  });
});
