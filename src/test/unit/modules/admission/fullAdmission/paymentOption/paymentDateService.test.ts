import paymentDateService
  from '../../../../../../main/modules/admission/fullAdmission/paymentOption/paymentDateService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {PaymentDate} from '../../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {
  VALID_DATE,
  VALID_DATE_NOT_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_YEAR,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {GenericForm} from "../../../../../../main/common/form/models/genericForm";


jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getDraftClaimFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('Payment Date service', () => {
  describe('Serialisation', () => {
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = paymentDateService.buildPaymentDate('2040', '1', '1');
      //Then
      expect(paymentDate.day).toBe(1);
      expect(paymentDate.month).toBe(1);
      expect(paymentDate.year).toBe(2040);
    });
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = paymentDateService.buildPaymentDate('--', '-', '+');
      //Then
      expect(paymentDate.day).toBeUndefined();
      expect(paymentDate.month).toBeUndefined();
      expect(paymentDate.year).toBeUndefined();
    });
  });
  describe('Validation', () => {
    test('should raise an error if nothing specified for date', async () => {
      //Given
      const paymentDate = new PaymentDate(undefined, undefined, undefined);
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(3);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_YEAR, max:VALID_YEAR});
    });
    test('should raise an error if no year', async () => {
      //Given
      const paymentDate = new PaymentDate(undefined, '12', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_YEAR, max: VALID_YEAR});
    });
    test('should raise an error if year is only 2 digits', async () => {
      //Given
      const paymentDate = new PaymentDate('23', '12', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: VALID_FOUR_DIGIT_YEAR});
    });
    test('should raise an error if date in the past', async () => {
      //Given
      const paymentDate = new PaymentDate('1990', '12', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('paymentDate');
      expect(form.getErrors()[0].constraints).toEqual({customDate: VALID_DATE_NOT_IN_PAST});
    });
    test('should raise an error if month greater than 12', async () => {
      //Given
      const paymentDate = new PaymentDate('2040', '13', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_MONTH});
    });
    test('should raise an error if month less than 1', async () => {
      //Given
      const paymentDate = new PaymentDate('2040', '0', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_MONTH});
    });
    test('should raise an error if day greater than 31', async () => {
      //Given
      const paymentDate = new PaymentDate('2040', '12', '32');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_DAY});
    });
    test('should raise an error if day less than 1', async () => {
      //Given
      const paymentDate = new PaymentDate('2040', '12', '-1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_DAY});
    });
    test('should raise an error if decimal specified for date', async () => {
      //Given
      const paymentDate = new PaymentDate('2020.45', '12', '1');
      //When
      const form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('paymentDate');
      expect(form.getErrors()[0].constraints).toEqual({isDate: VALID_DATE});
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should throw error when retrieving data from draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_GET_ERROR);
      });
      //Then
      await expect(
        paymentDateService.getPaymentDate('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
    });

    test('should throw error when saving data to draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {paymentDate: {}}};
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_SAVE_ERROR);
      });
      //Then
      await expect(
        paymentDateService.savePaymentDate('claimId', new PaymentDate(String(new Date().getFullYear()), '12', '1'))).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
    });
  });
});
