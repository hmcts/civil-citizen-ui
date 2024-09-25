import {defendantFinalPaymentDateService} from 'services/features/generalApplication/certOfSorC/defendantFinalPaymentDateService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

let paymentDate = new PaymentDate(undefined, undefined, undefined);
let form = new GenericForm<PaymentDate>(new PaymentDate());

describe('Payment Date service', () => {
  describe('Serialisation', () => {
    it('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = new DefendantFinalPaymentDate('2040', '1', '1');
      //Then
      expect(paymentDate.day).toBe(1);
      expect(paymentDate.month).toBe(1);
      expect(paymentDate.year).toBe(2040);
    });
    it('should keep the form input values unchanged after validation', async () => {
      //Given
      const paymentDate = new DefendantFinalPaymentDate('--', '-', '&');
      //Then
      expect(isNaN(paymentDate.day)).toBeTruthy();
      expect(isNaN(paymentDate.month)).toBeTruthy();
      expect(isNaN(paymentDate.year)).toBeTruthy();
    });
  });

  describe('get and save PaymentDate', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should save paymentDate', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await defendantFinalPaymentDateService.savePaymentDate('claimId', new DefendantFinalPaymentDate());
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });

  describe('Validation', () => {
    it('should raise an error if nothing specified for date', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate(undefined, undefined, undefined);
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(4);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({ isDefined: 'ERRORS.VALID_FINAL_DATE'});
      expect(form.getErrors()[1].property).toBe('day');
      expect(form.getErrors()[1].constraints).toEqual({ min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
      expect(form.getErrors()[2].property).toBe('month');
      expect(form.getErrors()[2].constraints).toEqual({ min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
      expect(form.getErrors()[3].property).toBe('year');
      expect(form.getErrors()[3].constraints).toEqual({ max: 'ERRORS.VALID_YEAR'});

    });
    it('should raise an error if no year', async () => {
      //Given
      paymentDate = new PaymentDate(undefined, '12', '1');
      //When
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
    });
    it('should raise an error if no month', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('9999', undefined, '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if no day', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('9999', '12', undefined);
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error asking for 4 digits, if year is only 1 digit', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('2', '12', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('23', '12', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an error asking for 4 digits, if year is only 3 digits', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('202', '12', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an no error if date in the past', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('1990', '12', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });

    it('should raise an error if month greater than 12', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('2040', '13', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_MONTH'});
    });

    it('should raise an error if month less than 1', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('2040', '0', '1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH'});
    });

    it('should raise an error if day greater than 31', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('2040', '12', '32');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_DAY'});
    });

    it('should raise an error if day less than 1', async () => {
      //Given
      paymentDate = new DefendantFinalPaymentDate('2040', '12', '-1');
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY'});
    });

    it('should raise an no error if yesterday specified for date', async () => {
      //Given
      const yesterday: Date = new Date(Date.now() - 1000 * 60 * 60 * 24);
      paymentDate = new DefendantFinalPaymentDate(yesterday.getFullYear().toString(), (yesterday.getMonth() + 1).toString(), yesterday.getDate().toString());
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });

    it('should not raise an error if today specified for date', async () => {
      //Given
      const today: Date = new Date(Date.now());
      paymentDate = new DefendantFinalPaymentDate(today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());
      //When
      form = new GenericForm<DefendantFinalPaymentDate>(paymentDate);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
