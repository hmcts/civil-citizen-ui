import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {mockClaim} from '../../../../../utils/mockClaim';

import {
  saveResponseType,
} from '../../../../../../main/services/features/response/responseType/citizenResponseTypeService';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const DRAFT_STORE_GET_ERROR = 'draft store get error';

describe('save responsetype = "PART_ADMISSION" setting to datastore and clear previous response type settings.', () => {
  it('should save data successfully', async () => {
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return mockClaim;
    });
    //When
    await (saveResponseType('claimId', ResponseType.PART_ADMISSION));
    //Then
    expect(spyGetCaseDataFromStore).toBeCalled();
    expect(spySaveDraftClaim).toBeCalled();
    expect(mockClaim?.partialAdmission.paymentIntention.paymentOption).toBeUndefined();
  });
});

describe('save responsetype = "FULL_ADMISSION" setting to datastore and clear previous response type settings.', () => {
  it('should save data successfully', async () => {
    //Given
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //mockClaim?.partialAdmission?.howMuchDoYouOwe?.totalAmount = 1000;
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return mockClaim;
    });
    //When
    await (saveResponseType('claimId', ResponseType.FULL_ADMISSION));
    //Then
    expect(spyGetCaseDataFromStore).toBeCalled();
    expect(spySaveDraftClaim).toBeCalled();
    expect(mockClaim?.partialAdmission?.howMuchDoYouOwe?.totalAmount).toBeUndefined();
  });
});

describe('save responsetype = "FULL_DEFENCE" setting to datastore and clear previous response type settings.', () => {
  it('should save data successfully', async () => {
    //Given
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return mockClaim;
    });
    //When
    await (saveResponseType('claimId', ResponseType.FULL_DEFENCE));
    //Then
    expect(spyGetCaseDataFromStore).toBeCalled();
    expect(spySaveDraftClaim).toBeCalled();
    expect(mockClaim?.partialAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
    expect(mockClaim?.fullAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
  });
});

describe('save responseType setting to datastore when respondent1 is not set.', () => {
  it('should save data successfully', async () => {
    //Given
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
    mockClaim.respondent1 = undefined;
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return mockClaim;
    });
    //When
    await (saveResponseType('claimId', 'undefined'));
    //Then
    expect(spyGetCaseDataFromStore).toBeCalled();
    expect(spySaveDraftClaim).toBeCalled();
    expect(mockClaim?.partialAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
    expect(mockClaim?.fullAdmission?.paymentIntention?.repaymentPlan).toBeUndefined();
  });
});

it('should throw error when retrieving data from draft store fails', async () => {
  //When
  mockGetCaseDataFromDraftStore.mockImplementation(async () => {
    throw new Error(DRAFT_STORE_GET_ERROR);
  });
  //Then
  await expect(
    saveResponseType('claimId', 'Undefined')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
});
