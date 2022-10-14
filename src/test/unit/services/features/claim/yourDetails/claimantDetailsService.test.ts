import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getClaimantInformation,
  getClaimantPartyInformation,
  saveClaimant,
  saveClaimantParty,
} from '../../../../../../main/services/features/claim/yourDetails/claimantDetailsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {buildPrimaryAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from '../../../../../../main/common/models/party';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {buildCitizenAddress} from '../../../../../utils/mockForm';
import {PartyDetails} from '../../../../../../main/common/form/models/partyDetails';
import {CitizenCorrespondenceAddress} from '../../../../../../main/common/form/models/citizenCorrespondenceAddress';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

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
  describe('get Claimant Party Information', () => {
    it('should return a empty object when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return {};
      });
      //When
      const result: Party = await getClaimantPartyInformation(CLAIM_ID);

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
      const result: Party = await getClaimantPartyInformation(CLAIM_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.applicant1);
    });
  });
  describe('save Claimant', () => {
    it('should save a claimant when has no information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.individualTitle = 'individualTitle';
      claimData.applicant1.individualFirstName = 'individualFirstName';
      claimData.applicant1.individualLastName = 'individualLastName';
      claimData.applicant1.primaryAddress = buildPrimaryAddress();
      claimData.applicant1.provideCorrespondenceAddress = YesNo.NO;

      //When
      await saveClaimant(CLAIM_ID, buildCitizenAddress().model, new CitizenCorrespondenceAddress(), YesNo.NO, claimantDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });

    it('should save a claimant when in redis correspondentAddress is undefined or empty and the citizenAddress without information', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
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
  describe('save Claimant Party', () => {
    it('should save a claimant when has no information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.partyName = 'PartyName';
      claimData.applicant1.contactPerson = 'Contact Person';
      claimData.applicant1.individualTitle = 'individualTitle';
      claimData.applicant1.individualFirstName = 'individualFirstName';
      claimData.applicant1.individualLastName = 'individualLastName';
      claimData.applicant1.primaryAddress = buildPrimaryAddress();
      claimData.applicant1.provideCorrespondenceAddress = YesNo.NO;

      //When
      await saveClaimantParty(CLAIM_ID, buildCitizenAddress().model, new CitizenCorrespondenceAddress(), YesNo.NO, claimData.applicant1);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });

    it('should save a claimant Party when in redis correspondentAddress is undefined or empty and the citizenAddress without information', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.partyName = 'PartyName';
      claimData.applicant1.contactPerson = 'Contact Person';

      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        const claimant = new Party();
        claimant.primaryAddress = buildPrimaryAddress();
        claim.respondent1 = claimant;
        return mockClaim;
      });
      //When
      await saveClaimantParty(CLAIM_ID, buildCitizenAddress().model, new CitizenCorrespondenceAddress(), YesNo.NO, claimData.applicant1);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });
});
