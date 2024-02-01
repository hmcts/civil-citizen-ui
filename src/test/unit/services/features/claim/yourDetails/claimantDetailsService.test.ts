import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getClaimantInformation,
  saveClaimantProperty,
} from 'services/features/claim/yourDetails/claimantDetailsService';
import {Claim} from 'models/claim';
import {mockClaim} from '../../../../../utils/mockClaim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';
const claimData = new Claim();

describe('Citizen details service', () => {
  describe('get Claimant Information', () => {
    it('should return a empty object when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return {};
      });
      //When
      const result: Party = await getClaimantInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual({});
    });
    it('should return a respondent Object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const result: Party = await getClaimantInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.applicant1);
    });
  });
  describe('get Claimant Party Information', () => {
    it('should return a empty object when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return {};
      });
      //When
      const result: Party = await getClaimantInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual({});
    });
    it('should return a respondent Object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const result: Party = await getClaimantInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.applicant1);
    });
  });

  describe('save Claimant single Property', () => {
    it('should save a claimant when has no information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.type = PartyType.INDIVIDUAL;

      //When
      await saveClaimantProperty(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });

    it('should save a claimant Party when type is already in redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.type = PartyType.ORGANISATION;
        return claim;
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.type = PartyType.INDIVIDUAL;

      //When
      await saveClaimantProperty(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });
  });
});
