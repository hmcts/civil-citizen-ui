import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getClaimantInformation,
  saveClaimant,
} from '../../../../../../main/services/features/claim/yourDetails/claimantDetailsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {buildPrimaryAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from '../../../../../../main/common/models/party';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {buildCitizenAddress, buildCitizenCorrespondenceAddress} from '../../../../../utils/mockForm';
import {PartyDetails} from '../../../../../../main/common/form/models/partyDetails';
import {CitizenCorrespondenceAddress} from '../../../../../../main/common/form/models/citizenCorrespondenceAddress';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';
const claimData = new Claim();
const claimantDetails = new PartyDetails(
  'individualTitle',
  'individualFirstName',
  'individualLastName',
);

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
  describe('save Claimant', () => {
    it('should save a claimant when has no information on redis ', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.individualTitle = 'individualTitle';
      claimData.applicant1.individualFirstName = 'individualFirstName';
      claimData.applicant1.individualLastName = 'individualLastName';
      claimData.applicant1.primaryAddress = buildPrimaryAddress();
      claimData.applicant1.provideCorrespondenceAddress = YesNo.NO;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      //When
      await saveClaimant(CLAIM_ID, buildCitizenAddress().model, new CitizenCorrespondenceAddress(), YesNo.NO, claimantDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });

    it('should save a claim when in redis is undefined', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      //When
      await saveClaimant(CLAIM_ID, buildCitizenAddress().model, buildCitizenCorrespondenceAddress().model, YesNo.NO, claimantDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    it('should save a claimant when in redis correspondentAddress is undefined or empty and the citizenAddress without information', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.individualTitle = 'individualTitle';
      claimData.applicant1.individualFirstName = 'individualFirstName';
      claimData.applicant1.individualLastName = 'individualLastName';
      claimData.applicant1.primaryAddress = buildPrimaryAddress();
      claimData.applicant1.provideCorrespondenceAddress = YesNo.NO;
      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        const claimant = new Party();
        claimant.primaryAddress = buildPrimaryAddress();
        claim.respondent1 = claimant;
        return mockClaim;
      });
      //When
      await saveClaimant(CLAIM_ID, buildCitizenAddress().model, new CitizenCorrespondenceAddress(), YesNo.NO, claimantDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });
});
