import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {
  getPaymentOptionForm,
  savePaymentOptionData,
} from '../../../../../../main/modules/admission/fullAdmission/paymentOption/paymentOptionService';
import PaymentOptionType
  from '../../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {REDIS_ERROR_MESSAGE} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import PaymentOption
  from '../../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentOption';
import {mockClaim} from '../../../../../utils/mockClaim';


jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
describe('payment option service', () => {
  describe('get payment option form', () => {
    it('should get populated form when data exists', async () => {
      //Given
      const claim = createClaim('IMMEDIATELY');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123');
      //Then
      expect(form.paymentType).toBe(PaymentOptionType.IMMEDIATELY);
    });
    it('should get new form when payment option is empty', async () => {
      //Given
      const claim = createClaim('');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getPaymentOptionForm('123');
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
      const form = await getPaymentOptionForm('123');
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should get new form when data does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      //When
      const form = await getPaymentOptionForm('123');
      //Then
      expect(form.paymentType).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(REDIS_ERROR_MESSAGE);
      });
      //Then
      await expect(getPaymentOptionForm('123')).rejects.toThrow(REDIS_ERROR_MESSAGE);
    });
  });
  describe('save payment option', () => {
    it('should save payment option successfully with existing claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE));
      //Then
      expect(spy).toBeCalled();
    });
    it('should save payment option successfully with no claim in draft store', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE));
      //Then
      expect(spy).toBeCalled();
    });
    it('should not reset payment date if PaymentOptionType is BY_SET_DATE', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE));
      //Then
      expect(spy).toBeCalled();
      expect(mockClaim.paymentDate).toEqual(new Date('2022-06-01T00:00:00'));
    });
    it('should reset payment date successfully if PaymentOptionType is not BY_SET_DATE', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePaymentOptionData('123', new PaymentOption(PaymentOptionType.IMMEDIATELY));
      //Then
      expect(spy).toBeCalled();
      expect(mockClaim.paymentDate).toBeUndefined();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(REDIS_ERROR_MESSAGE);
      });
      //Then
      await expect(savePaymentOptionData('123', new PaymentOption(PaymentOptionType.BY_SET_DATE))).rejects.toThrow(REDIS_ERROR_MESSAGE);
    });
  });
});

function createClaim(paymentOption: string) {
  const claim = new Claim();
  claim.paymentOption = paymentOption;
  return claim;
}
