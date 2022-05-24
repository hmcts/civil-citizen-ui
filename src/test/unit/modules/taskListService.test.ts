import {CorrespondenceAddress} from '../../../main/common/models/correspondenceAddress';
import {Claim} from '../../../main/common/models/claim';
import {
  getDescription,
  getTaskLists,
  getTitle,
  isOutstanding,
  outstandingTasksFromTaskLists,
} from '../../../main/modules/taskListService';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
} from '../../../main/common/utils/taskList/taskListBuilder';
import {ResponseType} from '../../../main/common/form/models/responseType';
import {TaskStatus} from '../../../main/common/models/taskList/TaskStatus';
import {deepCopy} from '../../utils/deepCopy';
import {Task} from '../../../main/common/models/taskList/task';
import {TaskList} from '../../../main/common/models/taskList/taskList';

describe('Response Task List service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  describe('none of the tasks completed', () => {
    const caseData = mockClaim.case_data;
    const actualTaskLists = getTaskLists(claim, caseData, mockClaimId);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return title', () => {
      //When
      const title = getTitle(actualTaskLists);
      //Then
      expect(title).toEqual('Application incomplete');
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists);
      //Then
      expect(description).toEqual('You have completed 0 of 3 sections');
    });
  });

  describe('when primary address and dob is provided, expect confirm your details completed', () => {
    const PRIMARY_ADDRESS_LINE_1 = 'Berry House';
    const PRIMARY_ADDRESS_LINE_2 = '12 Berry street';
    const PRIMARY_ADDRESS_TOWN = 'London';
    const PRIMARY_ADDRESS_POSTCODE = 'E1 6AN';
    const caseData = deepCopy(mockClaim.case_data);
    caseData.respondent1.primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actualTaskLists = getTaskLists(claim, caseData, mockClaimId);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists);
      //Then
      expect(actualTaskLists[0].tasks[0].description).toEqual('Confirm your details');
      expect(actualTaskLists[0].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('You have completed 1 of 3 sections');
    });
  });

  describe('when correspondence address and dob is provided, expect confirm your details completed', () => {
    const CORRESPONDENCE_ADDRESS_LINE_1 = 'PO Box';
    const CORRESPONDENCE_ADDRESS_LINE_2 = 'Dean close';
    const CORRESPONDENCE_TOWN = 'Bristol';
    const CORRESPONDENCE_POSTCODE = 'BS1 4HK';
    const caseData = deepCopy(mockClaim.case_data);
    caseData.respondent1.correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
    caseData.respondent1.primaryAddress = {};
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actualTaskLists = getTaskLists(claim, caseData, mockClaimId);

    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists);
      //Then
      expect(actualTaskLists[0].tasks[0].description).toEqual('Confirm your details');
      expect(actualTaskLists[0].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('You have completed 1 of 3 sections');
    });
  });

  describe('Choose a response task is completed when any of response type is selected ', () => {
    const CORRESPONDENCE_ADDRESS_LINE_1 = 'PO Box';
    const CORRESPONDENCE_ADDRESS_LINE_2 = 'Dean close';
    const CORRESPONDENCE_TOWN = 'Bristol';
    const CORRESPONDENCE_POSTCODE = 'BS1 4HK';
    const caseData = deepCopy(mockClaim.case_data);
    caseData.respondent1.correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
    caseData.respondent1.dateOfBirth = '15 May 1978';
    caseData.respondent1.responseType = ResponseType.FULL_ADMISSION;
    const actualTaskLists = getTaskLists(claim, caseData, mockClaimId);

    it('should return response task list', () => {
      //Given
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actualTaskLists).toMatchObject(filteredTaskGroups);
    });

    it('should return description', () => {
      //When
      const description = getDescription(actualTaskLists);
      //Then
      expect(actualTaskLists[1].tasks[0].description).toEqual('Choose a response');
      expect(actualTaskLists[1].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('You have completed 2 of 3 sections');
    });
  });

  describe('Check task counts towards outstanding tasks', () => {

    const task: Task = {
      description: 'X',
      url: 'url',
      status: TaskStatus.INCOMPLETE,
    };

    it('should be included when incomplete and not a check task', () => {
      //Given
      task.status = TaskStatus.INCOMPLETE;
      task.isCheckTask = false;
      //Then
      expect(isOutstanding(task)).toBe(true);
    });
    it('should be excluded when incomplete and a check task', () => {
      //Given
      task.status = TaskStatus.INCOMPLETE;
      task.isCheckTask = true;
      //Then
      expect(isOutstanding(task)).toBe(false);
    });
    it('should be excluded when complete and not a check task', () => {
      //Given
      task.status = TaskStatus.COMPLETE;
      task.isCheckTask = false;
      //Then
      expect(isOutstanding(task)).toBe(false);
    });
    it('should be excluded when complete and a check task', () => {
      //Given
      task.status = TaskStatus.COMPLETE;
      task.isCheckTask = true;
      //Then
      expect(isOutstanding(task)).toBe(false);
    });
  });
  describe('Check outstanding tasks', () => {

    const taskList: TaskList[] = [
      {
        title: 'Task List',
        tasks: [
          {
            description: 'Task 1',
            status: TaskStatus.COMPLETE,
            url: 'some URL',
          },
        ],
      },
    ];

    it('should be empty when all non-check tasks complete', () => {
      //Given
      taskList[0].tasks[0].status = TaskStatus.COMPLETE;
      //When
      const outstandingTasks = outstandingTasksFromTaskLists(taskList);
      //Then
      expect(outstandingTasks?.length).toBe(0);
    });
    it('should not be empty when at least one non-check task is incomplete', () => {
      //Given
      taskList[0].tasks[0].status = TaskStatus.INCOMPLETE;
      //When
      const outstandingTasks = outstandingTasksFromTaskLists(taskList);
      //Then
      expect(outstandingTasks?.length).toBe(1);
    });
    it('should be empty when only incomplete task is a check task', () => {
      //Given
      taskList[0].tasks[0].status = TaskStatus.INCOMPLETE;
      taskList[0].tasks[0].isCheckTask = true;
      //When
      const outstandingTasks = outstandingTasksFromTaskLists(taskList);
      //Then
      expect(outstandingTasks?.length).toBe(0);
    });
  });
});

function buildAddress(line1: string, line2: string, postcode: string, postTown: string): CorrespondenceAddress {
  return {
    AddressLine1: line1,
    AddressLine2: line2,
    PostCode: postcode,
    PostTown: postTown,
  };
}


