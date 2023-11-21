import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getClaimantInformation,
  saveClaimant,
  saveClaimantProperty,
} from '../../../../../../main/services/features/claim/yourDetails/claimantDetailsService';
import {Claim} from '../../../../../../main/common/models/claim';
import {buildAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from '../../../../../../main/common/models/party';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {buildCitizenAddress} from '../../../../../utils/mockForm';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {PartyType} from '../../../../../../main/common/models/partyType';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const CLAIM_ID = '123';
const claimData = new Claim();
const claimantDetails = new PartyDetailsCARM({
  individualTitle: 'Mr.',
  individualFirstName: 'John',
  individualLastName: 'Doe',
});

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
  describe('save Claimant', () => {
    it('should save a claimant when has no information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.partyDetails = new PartyDetailsCARM({});
      claimData.applicant1.partyDetails.individualTitle = 'Mr.';
      claimData.applicant1.partyDetails.individualFirstName = 'John';
      claimData.applicant1.partyDetails.individualLastName = 'Doe';
      claimData.applicant1.partyDetails.primaryAddress = buildAddress();
      claimData.applicant1.partyDetails.provideCorrespondenceAddress = YesNo.NO;
      claimData.applicant1.partyDetails.correspondenceAddress = buildCitizenAddress().model;

      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claimData);
    });

    it('should save a claimant when in redis correspondentAddress is undefined or empty and the citizenAddress without information', async () => {
      mockGetCaseData.mockImplementation(async () => {
        claimantDetails.provideCorrespondenceAddress = YesNo.NO;
        claimantDetails.primaryAddress = buildAddress();
        return claimantDetails;
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.partyDetails = new PartyDetailsCARM({});
      claimData.applicant1.partyDetails.individualTitle = 'Mr.';
      claimData.applicant1.partyDetails.individualFirstName = 'John';
      claimData.applicant1.partyDetails.individualLastName = 'Doe';
      claimData.applicant1.partyDetails.primaryAddress = buildAddress();
      claimData.applicant1.partyDetails.provideCorrespondenceAddress = YesNo.NO;
      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
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
      claimData.applicant1.partyDetails = new PartyDetailsCARM({});
      claimData.applicant1.partyDetails.partyName = 'PartyName';
      claimData.applicant1.partyDetails.contactPerson = 'Contact Person';
      claimData.applicant1.partyDetails.individualTitle = 'individualTitle';
      claimData.applicant1.partyDetails.individualFirstName = 'individualFirstName';
      claimData.applicant1.partyDetails.individualLastName = 'individualLastName';
      claimData.applicant1.partyDetails.primaryAddress = buildAddress();
      claimData.applicant1.partyDetails.provideCorrespondenceAddress = YesNo.NO;

      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
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
      claimData.applicant1.partyDetails = new PartyDetailsCARM({});
      claimData.applicant1.partyDetails.partyName = 'PartyName';
      claimData.applicant1.partyDetails.contactPerson = 'Contact Person';
      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });

  describe('save Claimant Property', () => {
    it('should save a claimant when has no information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetailsCARM({});
        claim.applicant1.partyDetails.partyName = 'PartyName';
        claim.applicant1.partyDetails.contactPerson = 'Contact Person';
        claim.applicant1.partyDetails.provideCorrespondenceAddress = YesNo.NO;
        return claim;
      });
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      claimData.applicant1 = new Party();
      claimData.applicant1.partyDetails = new PartyDetailsCARM({});
      claimData.applicant1.partyDetails.partyName = 'PartyName';
      claimData.applicant1.partyDetails.contactPerson = 'Contact Person';
      claimData.applicant1.partyDetails.individualTitle = 'individualTitle';
      claimData.applicant1.partyDetails.individualFirstName = 'individualFirstName';
      claimData.applicant1.partyDetails.individualLastName = 'individualLastName';
      claimData.applicant1.partyDetails.primaryAddress = buildAddress();
      claimData.applicant1.partyDetails.provideCorrespondenceAddress = YesNo.NO;

      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
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
      claimData.applicant1.partyDetails = new PartyDetailsCARM({partyName: 'PartyName', contactPerson: 'Contact Person'});

      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        const claimant = new Party();
        claimant.partyDetails = new PartyDetailsCARM({});
        claimant.partyDetails.primaryAddress = buildAddress();
        claim.respondent1 = claimant;
        return mockClaim;
      });
      //When
      await saveClaimant(CLAIM_ID, claimData.applicant1.partyDetails);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
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
