import paymentDateService
  from '../../../../../../main/modules/admission/fullAdmission/paymentOption/paymentDateService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {PaymentDate} from '../../../../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {
  VALID_DATE_NOT_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_YEAR,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';


jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getDraftClaimFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

let paymentDate = new PaymentDate(undefined, undefined, undefined);
let form = new GenericForm<PaymentDate>(new PaymentDate());

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
      const paymentDate = paymentDateService.buildPaymentDate('--', '-', '&');
      //Then
      expect(isNaN(paymentDate.day)).toBeTruthy();
      expect(isNaN(paymentDate.month)).toBeTruthy();
      expect(isNaN(paymentDate.year)).toBeTruthy();
    });
  });
  describe('Validation', () => {
    test('should raise an error if nothing specified for date', async () => {
      //Given
      paymentDate = new PaymentDate(undefined, undefined, undefined);
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(3);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max:VALID_YEAR});
      expect(form.getErrors()[1].property).toBe('month');
      expect(form.getErrors()[1].constraints).toEqual({min:VALID_MONTH,max:VALID_MONTH});
      expect(form.getErrors()[2].property).toBe('day');
      expect(form.getErrors()[2].constraints).toEqual({min:VALID_DAY,max:VALID_DAY});
    });
    test('should raise an error if no year', async () => {
      //Given
      paymentDate = new PaymentDate(undefined, '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_YEAR});
    });
    test('should raise an error if no month', async () => {
      //Given
      paymentDate = new PaymentDate('9999', undefined, '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min:VALID_MONTH, max: VALID_MONTH});
    });
    test('should raise an error if no day', async () => {
      //Given
      paymentDate = new PaymentDate('9999', '12', undefined);
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min:VALID_DAY, max: VALID_DAY});
    });
    test('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      //Given
      paymentDate = new PaymentDate('23', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: VALID_FOUR_DIGIT_YEAR});
    });
    test('should raise an error if date in the past', async () => {
      //Given
      paymentDate = new PaymentDate('1990', '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('paymentDate');
      expect(form.getErrors()[0].constraints).toEqual({customDate: VALID_DATE_NOT_IN_PAST});
    });
    test('should raise an error if month greater than 12', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '13', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_MONTH});
    });
    test('should raise an error if month less than 1', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '0', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_MONTH});
    });
    test('should raise an error if day greater than 31', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '12', '32');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_DAY});
    });
    test('should raise an error if day less than 1', async () => {
      //Given
      paymentDate = new PaymentDate('2040', '12', '-1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_DAY});
    });
    test('should not raise an error if date in future', async () => {
      //Given
      paymentDate = new PaymentDate('9999', '12', '31');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if yesterday specified for date', async () => {
      //Given
      const yesterday : Date = new Date(Date.now() - 1000*60*60*24);
      paymentDate = new PaymentDate(yesterday.getFullYear().toString(), (yesterday.getMonth() + 1).toString(), yesterday.getDate().toString());
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('paymentDate');
      expect(form.getErrors()[0].constraints).toEqual({customDate: VALID_DATE_NOT_IN_PAST});
    });
    test('should not raise an error if today specified for date', async () => {
      //Given
      const today : Date = new Date(Date.now());
      paymentDate = new PaymentDate(today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
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
