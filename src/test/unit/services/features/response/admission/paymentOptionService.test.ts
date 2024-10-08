import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from 'services/features/response/admission/paymentOptionService';
import {PaymentOptionType}
  from 'common/form/models/admission/paymentOption/paymentOptionType';
import {PaymentOption}
  from 'common/form/models/admission/paymentOption/paymentOption';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'common/form/models/responseType';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {mockClaim} from '../../../../../utils/mockClaim';
import {FullAdmission} from 'common/models/fullAdmission';
import { YesNo } from 'common/form/models/yesNo';

jest.mock('.../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('payment option service', () => {
  describe('get payment option form when full admission', () => {
    it('should get populated form when data exists', async () => {
      //Given
      const claim = createClaim(PaymentOptionType.IMMEDIATELY);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm(claim, ResponseType.FULL_ADMISSION);
      //Then
      expect(form.paymentType).toBe(PaymentOptionType.IMMEDIATELY);
    });

    it('should get new form when payment option undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm(claim, ResponseType.FULL_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });
  });
  describe('save payment option when full admission', () => {
    it('should save payment option successfully with existing claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.FULL_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should save payment option successfully with no claim in draft store', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.FULL_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should clear financial details when switching to immediate option if exists ', async () => {
      //Given
      const claim = new Claim();
      claim.partialAdmission = new FullAdmission();
      claim.statementOfMeans = {
        disability: { option: YesNo.YES },
      };
      mockGetCaseData.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.FULL_ADMISSION);

      expect(claim.statementOfMeans).toBeUndefined();

    });
  });
  describe('get payment option form when part admission', () => {
    it('should get populated form when data exists', async () => {
      //Given
      const claim = createPartialAdmissionClaim(PaymentOptionType.INSTALMENTS);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm(claim, ResponseType.PART_ADMISSION);
      //Then
      expect(form.paymentType).toBe(PaymentOptionType.INSTALMENTS);
    });

    it('should get new form when payment option undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm(claim, ResponseType.PART_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });

  });
  describe('save payment option when part admission', () => {
    it('should save payment option successfully with existing claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should save payment option successfully and remove payment date if the option different than set by date', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should save payment option successfully with no payment intention in draft store', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.partialAdmission = new PartialAdmission();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should clear financial details when switching to immediate option if exists ', async () => {
      //Given
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.statementOfMeans = {
        disability: { option: YesNo.YES },
      };
      mockGetCaseData.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.IMMEDIATELY), ResponseType.PART_ADMISSION);

      expect(claim.statementOfMeans).toBeUndefined();

    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE), ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim(paymentOption: PaymentOptionType) {
  const claim = new Claim();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
}

function createPartialAdmissionClaim(paymentOption: PaymentOptionType) {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
}
