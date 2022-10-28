import {
  resetPreviousResponseTypeSettings,
} from '../../../../../main/services/features/response/resetPreviousResponseTypeSettingService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {mockClaim} from '../../../../utils/mockClaim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const DRAFT_STORE_GET_ERROR = 'draft store get error';

it('should clear the partialAdmission when responseType changed', async () => {
  //Given
  const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
  const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
  mockGetCaseDataFromDraftStore.mockImplementation(async () => {
    return mockClaim;
  });

  //When
  await (resetPreviousResponseTypeSettings('claimId'));

  //Then
  expect(spyGetCaseDataFromStore).toBeCalled();
  expect(spySaveDraftClaim).toBeCalled();
  expect(mockClaim.paymentOption).toEqual(undefined);
});

it('should throw error when retrieving data from draft store fails', async () => {
  //When
  mockGetCaseDataFromDraftStore.mockImplementation(async () => {
    throw new Error(DRAFT_STORE_GET_ERROR);
  });
  //Then
  await expect(
    resetPreviousResponseTypeSettings('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
});
