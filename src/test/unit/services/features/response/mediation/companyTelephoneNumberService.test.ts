import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getCompanyTelephoneNumberData,
  saveCompanyTelephoneNumberData,
} from '../../../../../../main/services/features/response/mediation/companyTelephoneNumberService';
import {Claim} from '../../../../../../main/common/models/claim';
import {Mediation} from '../../../../../../main/common/models/mediation/mediation';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CompanyTelephoneNumber} from '../../../../../../main/common/form/models/mediation/companyTelephoneNumber';
import {CaseState} from 'common/form/models/claimDetails';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {Party} from 'common/models/party';
import {PartyPhone} from 'common/models/PartyPhone';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

describe('Mediation - Company or Organisation - Confirm telephone number Service', () => {
  const telephoneNumber = '0123456789';
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getHowMuchDoYouOweForm', () => {
    it('should get empty form when mediation does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const response = await getCompanyTelephoneNumberData('129');
      const [contactPerson, form] = response;
      //Then
      expect(form.option).toBeUndefined();
      expect(contactPerson).toBeUndefined();
    });
    it('should get empty form when mediation does not exist for Claimant Response', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const response = await getCompanyTelephoneNumberData('129');
      const [contactPerson, form] = response;
      //Then
      expect(form.option).toBeUndefined();
      expect(contactPerson).toBeUndefined();
    });
    it('should return an empty form when companyTelephoneNumber does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.mediation = new Mediation();
        return claim;
      });
      //When
      const response = await getCompanyTelephoneNumberData('129');
      const [contactPerson, form] = response;
      //Then
      expect(form.option).toBeUndefined();
      expect(contactPerson).toBeUndefined();
    });
    it('should return populated form when companyTelephoneNumber exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.mediation = new Mediation();
        claim.mediation.companyTelephoneNumber = new CompanyTelephoneNumber(YesNo.YES, undefined, undefined, telephoneNumber);
        return claim;
      });
      //When
      const response = await getCompanyTelephoneNumberData('123');
      const form = response[1];
      //Then
      expect(form.option).toBeTruthy();
      expect(form.mediationPhoneNumberConfirmation).toBe(telephoneNumber);
    });
    it('should return populated form when companyTelephoneNumber exists for Claimant Response', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.mediation = new Mediation();
        claim.claimantResponse.mediation.companyTelephoneNumber = new CompanyTelephoneNumber(YesNo.YES, undefined, undefined, telephoneNumber);
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const response = await getCompanyTelephoneNumberData('123');
      const form = response[1];
      //Then
      expect(form.option).toBeTruthy();
      expect(form.mediationPhoneNumberConfirmation).toBe(telephoneNumber);
    });
    it('should return populated form when companyTelephoneNumber exists for Claimant Response', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = new PartyPhone('123123123');
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const response = await getCompanyTelephoneNumberData('123');
      const form = response[1];
      //Then
      expect(form.mediationPhoneNumberConfirmation).toBe('123123123');
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getCompanyTelephoneNumberData('129')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('saveCompanyTelephoneNumberData', () => {
    it('should save data successfully when claim exists but no mediation', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveCompanyTelephoneNumberData('129', new CompanyTelephoneNumber(YesNo.YES, undefined, undefined, telephoneNumber));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save data successfully when claim exists but no mediation for Claimant Response', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveCompanyTelephoneNumberData('129', new CompanyTelephoneNumber(YesNo.YES, undefined, undefined, telephoneNumber));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw an error when redis throws an error', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveCompanyTelephoneNumberData('129', new CompanyTelephoneNumber(YesNo.YES, undefined, undefined, telephoneNumber))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
