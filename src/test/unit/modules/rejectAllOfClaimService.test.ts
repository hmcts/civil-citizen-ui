import {
  getclaimantName,
  getRejectAllOfClaim,
  saveRejectAllOfClaim,
} from '../../../main/modules/rejectAllOfClaimService';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import rejectAllOfClaimType from '../../../main/common/form/models/rejectAllOfClaimType';
import {RejectAllOfClaim} from '../../../main/common/form/models/rejectAllOfClaim';
import {Respondent} from '../../../main/common/models/respondent';
import {CounterpartyType} from '../../../main/common/models/counterpartyType';
import {TestMessages} from '../../utils/errorMessageTestConstants';

jest.mock('../../../main/modules/draft-store');
jest.mock('../../../main/modules/draft-store/draftStoreService');

describe('rejectAllOfClaim service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('get rejectAllOfClaim form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const result = await getRejectAllOfClaim('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeUndefined();
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getRejectAllOfClaim('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeTruthy();
      expect(result.option.length).toBe(11);
    });
    it('should return populated form model when ORGANISATION data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getclaimantName('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toBeTruthy();
      expect(result.match('Test'));
    });
    it('should return populated form model when INDIVIDUAL data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      if (claim.respondent1?.type) {
        claim.respondent1.type = CounterpartyType.INDIVIDUAL;
      }
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getclaimantName('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toBeTruthy();
      expect(result.match('Mr. TestName TestLastName'));
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getclaimantName('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('save rejectAllOfClaim data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = createClaim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveRejectAllOfClaim('123', new RejectAllOfClaim(rejectAllOfClaimType.ALREADY_PAID));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});

function createClaim() {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim(rejectAllOfClaimType.ALREADY_PAID);
  claim.respondent1 = new Respondent();
  claim.respondent1.type = CounterpartyType.ORGANISATION;
  claim.respondent1.partyName = 'Test';
  claim.respondent1.individualTitle = 'Mr.';
  claim.respondent1.individualFirstName = 'TestName';
  claim.respondent1.individualLastName = 'TestLastName';
  return claim;
}
