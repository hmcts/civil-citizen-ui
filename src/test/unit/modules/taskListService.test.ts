import {CorrespondenceAddress} from '../../../main/common/models/correspondenceAddress';
import {Claim} from '../../../main/common/models/claim';
import {getTaskLists, getTitle, getDescription} from '../../../main/modules/taskListService';
import {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection, buildSubmitSection,
} from '../../../main/common/utils/taskList/taskListBuilder';
import {ResponseType} from '../../../main/common/form/models/responseType';
import {TaskStatus} from '../../../main/common/models/taskList/TaskStatus';
import {deepCopy} from '../../utils/deepCopy';

describe('Response Task List service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  describe('none of the tasks completed', () => {
    const caseData = mockClaim.case_data;
    const actaulTaskLists = getTaskLists(claim, caseData, mockClaimId);
    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondeToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actaulTaskLists).toMatchObject(filteredTaskGroups);
    });
    it('should return title', () => {
      //When
      const title = getTitle(actaulTaskLists);
      //Then
      expect(title).toEqual('Application incomplete');
    });
    it('should return description', () => {
      //When
      const description = getDescription(actaulTaskLists);
      //Then
      expect(description).toEqual('You have completed 0 of 3 sections');
    });
  });

  describe('when primary adress and dob is provided, expect confirm your details completed', () => {
    const PRIMARY_ADDRESS_LINE_1 = 'Berry House';
    const PRIMARY_ADDRESS_LINE_2 = '12 Berry street';
    const PRIMARY_ADDRESS_TOWN = 'London';
    const PRIMARY_ADDRESS_POSTCODE = 'E1 6AN';
    const caseData = deepCopy(mockClaim.case_data);
    caseData.respondent1.primaryAddress = buildAddress(PRIMARY_ADDRESS_LINE_1, PRIMARY_ADDRESS_LINE_2, PRIMARY_ADDRESS_TOWN, PRIMARY_ADDRESS_POSTCODE);
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actaulTaskLists = getTaskLists(claim, caseData, mockClaimId);
    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondeToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actaulTaskLists).toMatchObject(filteredTaskGroups);
    });
    it('should return description', () => {
      //When
      const description = getDescription(actaulTaskLists);
      //Then
      expect(actaulTaskLists[0].tasks[0].description).toEqual('Confirm your details');
      expect(actaulTaskLists[0].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('You have completed 1 of 3 sections');
    });
  });
  describe('when correspondence adress and dob is provided, expect confirm your details completed', () => {
    const CORRESPONDENCE_ADDRESS_LINE_1 = 'PO Box';
    const CORRESPONDENCE_ADDRESS_LINE_2 = 'Dean close';
    const CORRESPONDENCE_TOWN = 'Bristol';
    const CORRESPONDENCE_POSTCODE = 'BS1 4HK';
    const caseData = deepCopy(mockClaim.case_data);
    caseData.respondent1.correspondenceAddress = buildAddress(CORRESPONDENCE_ADDRESS_LINE_1, CORRESPONDENCE_ADDRESS_LINE_2, CORRESPONDENCE_TOWN, CORRESPONDENCE_POSTCODE);
    caseData.respondent1.primaryAddress = {};
    caseData.respondent1.dateOfBirth = '15 May 1978';
    const actaulTaskLists = getTaskLists(claim, caseData, mockClaimId);
    it('should return response task list', () => {
      //when
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondeToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actaulTaskLists).toMatchObject(filteredTaskGroups);
    });
    it('should return description', () => {
      //When
      const description = getDescription(actaulTaskLists);
      //Then
      expect(actaulTaskLists[0].tasks[0].description).toEqual('Confirm your details');
      expect(actaulTaskLists[0].tasks[0].status).toEqual(TaskStatus.COMPLETE);
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
    const actaulTaskLists = getTaskLists(claim, caseData, mockClaimId);
    it('should return response task list', () => {
      //Given
      const taskListPrepareYourResponse = buildPrepareYourResponseSection(claim, caseData, mockClaimId);
      const taskListRespondeToClaim = buildRespondToClaimSection(caseData, mockClaimId);
      const taskListSubmitYourResponse = buildSubmitSection(mockClaimId);
      const taskGroups = [taskListPrepareYourResponse, taskListRespondeToClaim, taskListSubmitYourResponse];
      const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
      //Then
      expect(actaulTaskLists).toMatchObject(filteredTaskGroups);
    });
    it('should return description', () => {
      //When
      const description = getDescription(actaulTaskLists);
      //Then
      expect(actaulTaskLists[1].tasks[0].description).toEqual('Choose a response');
      expect(actaulTaskLists[1].tasks[0].status).toEqual(TaskStatus.COMPLETE);
      expect(description).toEqual('You have completed 2 of 3 sections');
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


