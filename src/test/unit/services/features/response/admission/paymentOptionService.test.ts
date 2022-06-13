import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../../main/services/features/response/admission/paymentOptionService';
import PaymentOptionType
  from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import PaymentOption
  from '../../../../../../main/common/form/models/admission/paymentOption/paymentOption';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
import {PartialAdmission} from '../../../../../../main/common/models/partialAdmission';
import {PaymentIntention} from '../../../../../../main/common/form/models/admission/paymentIntention';
import {mockClaim} from '../../../../../utils/mockClaim';

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
      const form = await getPaymentOptionForm('123', ResponseType.FULL_ADMISSION);
      //Then
      expect(form.paymentType).toBe(PaymentOptionType.IMMEDIATELY);
    });
    it('should get new form when payment option is empty', async () => {
      //Given
      const claim = createClaim(undefined);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123', ResponseType.FULL_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should get new form when payment option undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123', ResponseType.FULL_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getPaymentOptionForm('123', ResponseType.FULL_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
  });
  describe('get payment option form when part admission', () => {
    it('should get populated form when data exists', async () => {
      //Given
      const claim = createPartialAdmissionClaim(PaymentOptionType.INSTALMENTS);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.paymentType).toBe(PaymentOptionType.INSTALMENTS);
    });
    it('should get new form when payment option is empty', async () => {
      //Given
      const claim = createPartialAdmissionClaim(undefined);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should get new form when payment option undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getPaymentOptionForm('123', ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
  claim.paymentOption = paymentOption;
  return claim;
}

function createPartialAdmissionClaim(paymentOption: PaymentOptionType) {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
}
