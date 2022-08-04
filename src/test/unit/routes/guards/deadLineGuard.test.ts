// import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../../../main/routes/urls';
// import {AllResponseTasksCompletedGuard} from '../../../../main/routes/guards/allResponseTasksCompletedGuard';
import express from 'express';
// import {TaskStatus} from '../../../../main/common/models/taskList/TaskStatus';
// import {constructResponseUrlWithIdParams} from '../../../../main/common/utils/urlFormatter';
// import {getTaskLists, outstandingTasksFromTaskLists} from '../../../../main/services/features/response/taskListService';
// import {TaskList} from '../../../../main/common/models/taskList/taskList';
// import {Task} from '../../../../main/common/models/taskList/task';
import { ResponseDeadline, ResponseOptions } from '../../../../main/common/form/models/responseDeadline';
import { Claim } from '../../../../main/common/models/claim';
import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import { deadLineGuard } from '../../../../main/routes/guards/deadLineGuard';
// import { CLAIM_TASK_LIST_URL } from '../../../../main/routes/urls';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const MOCK_REQUEST = () => {
  return { cookies: { newDeadlineDate: '123' } } as express.Request;
};

const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as express.Response;

const MOCK_NEXT = jest.fn() as express.NextFunction;

describe('Deadline Guard', () => {

  // mockGetCaseData.mockImplementation(async () => mockClaim);

  // const claim = new Claim();
  // claim.applicant1 = {
  //   partyName: 'Mr. James Bond',
  //   type: CounterpartyType.INDIVIDUAL,
  // };
  // claim.responseDeadline = {
  //   agreedResponseDeadline: extendedDate,
  // };
  // mockGetCaseDataFromStore.mockImplementation(async () => claim);

  it('should responde Unauthorized', async () => {

    const mockClaim = new Claim();
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.ALREADY_AGREED;
    mockClaim.responseDeadline.agreedResponseDeadline = new Date();

    const mockRequest = MOCK_REQUEST();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    await deadLineGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
    // expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
    // expect(MOCK_NEXT).not.toHaveBeenCalled();
    // expect(MOCK_NEXT).toHaveBeenCalled();
  });

  // it('should catch error', async () => {
  //   const mockGetTaskList = isUnauthorized as jest.Mock;

  //   //Given
  //   const mockRequest = MOCK_REQUEST();
  //   mockGetTaskList.mockImplementation(async () => {
  //     const taskList: TaskList[] = [];
  //     return taskList;
  //   });
  //   //When
  //   await AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL)(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
  //   //Then
  //   expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  //   expect(MOCK_NEXT).toHaveBeenLastCalledWith(expect.objectContaining({
  //     message: 'Task list cannot be empty',
  //   }));
  // });


  // it('should responde authorized', async () => {

  //   const mockClaim = new Claim();
  //   mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
  //   mockClaim.responseDeadline = new ResponseDeadline();
  //   mockClaim.responseDeadline.option = ResponseOptions.REQUEST_REFUSED;
  //   // mockClaim.responseDeadline.agreedResponseDeadline = new Date();

  //   const mockRequest = MOCK_REQUEST();
  //   mockGetCaseData.mockImplementation(async () => mockClaim);
  //   await deadLineGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);
  //   expect(MOCK_NEXT).not.toHaveBeenCalled();
  //   // expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);

  //   // expect(MOCK_NEXT).toHaveBeenCalled();
  // });
  // it('should call next', async () => {

  // });

  // it('should catch error', async () => {

  // });

});
