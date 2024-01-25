import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {getTelephone, saveTelephone} from '../../../../../main/services/features/claim/yourDetails/phoneService';
import {Claim} from '../../../../../main/common/models/claim';
import {Party} from '../../../../../main/common/models/party';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {CitizenTelephoneNumber} from '../../../../../main/common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant, PartyType} from '../../../../../main/common/models/partyType';
import {PartyPhone} from '../../../../../main/common/models/PartyPhone';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const party: Party = {
  partyDetails: {
    title: '',
    lastName: '',
    firstName: '',
    partyName: '',
  },
  partyPhone: {phone: '01632960001'},
  type: PartyType.INDIVIDUAL,
};

const PHONE_NUMBER = '01632960001';

describe('Claimant Phone Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getTelephone', () => {
    it('should get empty form when no data exist for applicant', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.CLAIMANT);
      //Then
      expect(form.telephoneNumber).toBeUndefined();
      expect(form.telephoneNumber).toEqual(undefined);
    });

    it('should get empty form when no data exist for defendant', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(form.telephoneNumber).toBeUndefined();
      expect(form.telephoneNumber).toEqual(undefined);
    });

    it('should get empty form when claimant phone does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = party;
        claim.applicant1.partyPhone.phone = '';
        return claim;
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.CLAIMANT);
      //Then
      expect(form.telephoneNumber).toEqual('');
    });

    it('should get empty form when defendant phone does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.partyPhone = new PartyPhone('');
        return claim;
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(form.telephoneNumber).toEqual('');
    });

    it('should return populated form when claimant phone exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = new PartyPhone(PHONE_NUMBER);
        return claim;
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.CLAIMANT);

      //Then
      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should return populated form when defendant phone exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.partyPhone = new PartyPhone(PHONE_NUMBER);
        return claim;
      });
      //When
      const form = await getTelephone('123', ClaimantOrDefendant.DEFENDANT);

      //Then
      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should save defendant phone data successfully when claim exists and respondent1 not defined', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save claimant phone data successfully when claim exists applicant1 not defined', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs for applicant', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getTelephone('123', ClaimantOrDefendant.CLAIMANT)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs for defendant', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getTelephone('123', ClaimantOrDefendant.DEFENDANT)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantPhone', () => {
    it('should save claimant phone data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = party;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save defendant phone data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        //claim.respondent1 = respondent;
        claim.applicant1 = party;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save claimant/defendant phone data successfully when claim exists and properties are not defined', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim or applicant', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on get claim or defendant', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should save claimant phone data successfully when claim exists with ccd Phone', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = party;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER, true), ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save claimant phone data successfully when claim exists with ccd Phone', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = party;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveTelephone('123', new CitizenTelephoneNumber(PHONE_NUMBER, false), ClaimantOrDefendant.DEFENDANT);
      //Then
      expect(spySave).toBeCalled();
    });
  });
});
