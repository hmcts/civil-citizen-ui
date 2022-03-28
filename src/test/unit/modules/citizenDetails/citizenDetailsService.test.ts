import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import {getRespondentInformation, saveRespondent} from '../../../../main/modules/citizenDetails/citizenDetailsService';
import {Respondent} from '../../../../main/common/models/respondent';
import {buildCorrespondenceAddress, buildPrimaryAddress, mockClaim} from '../../../utils/mockClaim';

import {buildCitizenAddress, buildCitizenCorrespondenceAddress} from '../../../utils/mockForm';
import {Claim} from '../../../../main/common/models/claim';

jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';

describe('Citizen details service', () => {
  describe('get Respondent Information', () => {
    it('should return a respondent Object empty when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return new Respondent();
      });
      //when
      const result: Respondent = await getRespondentInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new Respondent());
    });

    it('should return a respondent Object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      //when
      const result: Respondent = await getRespondentInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.respondent1);
    });
  });
  describe('save Respondent', () => {
    it('should save a respondent when has no information on redis ', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const respondentResult = new Respondent();
      respondentResult.primaryAddress =  buildPrimaryAddress();
      respondentResult.correspondenceAddress = buildCorrespondenceAddress();
      const resultClaim = new Claim();
      resultClaim.respondent1 =  respondentResult;
      resultClaim.respondent1ResponseDeadline = new Date('2022-01-24T15:59:59');
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1ResponseDeadline = new Date('2022-01-24T15:59:59');
        return claim;
      });

      //when
      await saveRespondent(CLAIM_ID, buildCitizenAddress(), buildCitizenCorrespondenceAddress());

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, resultClaim);

    });

    it('should save a respondent when has full information on redis', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      //when
      await saveRespondent(CLAIM_ID, buildCitizenAddress(), buildCitizenCorrespondenceAddress());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, mockClaim);
    });

    it('should save a respondent when in redis is undefined on redis', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const resultClaim = new Claim();
      const respondentResult = new Respondent();
      resultClaim.respondent1 =  respondentResult;
      resultClaim.respondent1ResponseDeadline = new Date('2022-01-24T15:59:59');
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      //when
      await saveRespondent(CLAIM_ID, buildCitizenAddress(), buildCitizenCorrespondenceAddress());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });
});
