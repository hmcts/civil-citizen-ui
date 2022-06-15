import howMuchHaveYouPaidService
  from '../../../../../../../main/services/features/response/admission/howMuchHaveYouPaidService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {HowMuchHaveYouPaid} from '../../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {
  ENTER_PAYMENT_EXPLANATION,
  VALID_AMOUNT,
  VALID_DATE,
  VALID_DATE_IN_PAST,
  VALID_DAY,
  VALID_FOUR_DIGIT_YEAR,
  VALID_MONTH,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_YEAR,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {mockClaim} from '../../../../../../utils/mockClaim';
import {ResponseType} from '../../../../../../../main/common/form/models/responseType';


jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

let howMuchHaveYouPaid = new HowMuchHaveYouPaid();
let form = new GenericForm<HowMuchHaveYouPaid>(new HowMuchHaveYouPaid());

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('HowMuchHaveYouPaid service', () => {
  describe('Serialisation', () => {
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(20, 40, '2040', '1', '1', 'I paid half');
      //Then
      expect(howMuchHaveYouPaid.amount).toBe(20);
      expect(howMuchHaveYouPaid.totalClaimAmount).toBe(40);
      expect(howMuchHaveYouPaid.day).toBe(1);
      expect(howMuchHaveYouPaid.month).toBe(1);
      expect(howMuchHaveYouPaid.year).toBe(2040);
      expect(howMuchHaveYouPaid.text).toBe('I paid half');
    });
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(0, 0, '&', '%', '$', undefined);
      //Then
      expect(Number.isNaN(howMuchHaveYouPaid.amount)).toBeFalsy();
      expect(Number.isNaN(howMuchHaveYouPaid.totalClaimAmount)).toBeFalsy();
      expect(isNaN(howMuchHaveYouPaid.day)).toBeTruthy();
      expect(isNaN(howMuchHaveYouPaid.month)).toBeTruthy();
      expect(isNaN(howMuchHaveYouPaid.year)).toBeTruthy();
      expect(howMuchHaveYouPaid.text).toBeUndefined();
    });
  });

  describe('get and save HowMuchHaveYouPaid', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('should return empty HowMuchHaveYouPaid when nothing retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      //When
      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid('claimId', ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(howMuchHaveYouPaid.amount).toBeUndefined();
      expect(howMuchHaveYouPaid.totalClaimAmount).toBeUndefined();
      expect(howMuchHaveYouPaid.year).toBeUndefined();
      expect(howMuchHaveYouPaid.month).toBeUndefined();
      expect(howMuchHaveYouPaid.day).toBeUndefined();
      expect(howMuchHaveYouPaid.date).toBeNull();
      expect(howMuchHaveYouPaid.text).toBeUndefined();
    });
    test('should return undefined when case_data, but no howMuchHaveYouPaid, retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      //When
      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid('claimId', ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(howMuchHaveYouPaid.amount).toBeUndefined();
      expect(howMuchHaveYouPaid.totalClaimAmount).toBeUndefined();
      expect(howMuchHaveYouPaid.year).toBeUndefined();
      expect(howMuchHaveYouPaid.month).toBeUndefined();
      expect(howMuchHaveYouPaid.day).toBeUndefined();
      expect(howMuchHaveYouPaid.date).toBeNull();
      expect(howMuchHaveYouPaid.text).toBeUndefined();
    });
    test('should return HowMuchHaveYouPaid when HowMuchHaveYouPaid Partial Admission retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid('claimId', ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(howMuchHaveYouPaid).not.toBeNull();
      expect(howMuchHaveYouPaid).toEqual(mockClaim?.partialAdmission?.howMuchHaveYouPaid);
    });
    test('should return HowMuchHaveYouPaid when HowMuchHaveYouPaid full Rejection retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      //When
      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid('claimId', ResponseType.FULL_DEFENCE);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(howMuchHaveYouPaid).not.toBeNull();
      expect(howMuchHaveYouPaid).toEqual(mockClaim?.rejectAllOfClaim?.howMuchHaveYouPaid);
    });

    test('should save howMuchHaveYouPaid when nothing in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return undefined;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid('claimId', new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save howMuchHaveYouPaid when case_data, but no howMuchHaveYouPaid, in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {}};
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid('claimId', new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });

    test('should save howMuchHaveYouPaid when claim in Redis draft store', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaim;
      });
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid('claimId', new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION);
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith('claimId', mockClaim);
    });
  });
  describe('Validation', () => {
    test('should raise an error if nothing specified for date', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(5);
      expect(form.getErrors()[0].property).toBe('amount');
      expect(form.getErrors()[0].constraints).toEqual({
        isDefined: VALID_AMOUNT,
        isNumber: VALID_TWO_DECIMAL_NUMBER,
        min: VALID_AMOUNT,
      });
      expect(form.getErrors()[1].property).toBe('day');
      expect(form.getErrors()[1].constraints).toEqual({min: VALID_DAY, max: VALID_DAY});
      expect(form.getErrors()[2].property).toBe('month');
      expect(form.getErrors()[2].constraints).toEqual({min: VALID_MONTH, max: VALID_MONTH});
      expect(form.getErrors()[3].property).toBe('year');
      expect(form.getErrors()[3].constraints).toEqual({max: VALID_YEAR});
      expect(form.getErrors()[4].property).toBe('text');
      expect(form.getErrors()[4].constraints).toEqual({isNotEmpty: ENTER_PAYMENT_EXPLANATION});

    });
    test('should raise an error if no text', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2021',
        month: '12',
        day: '1',
        text: undefined,
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('text');
      expect(form.getErrors()[0].constraints).toEqual({isNotEmpty: ENTER_PAYMENT_EXPLANATION});
    });
    test('should raise an error if no year', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: undefined,
        month: '12',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_YEAR});
    });
    test('should raise an error if no month', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '9999',
        month: undefined,
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_MONTH, max: VALID_MONTH});
    });
    test('should raise an error if no day', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '9999',
        month: '12',
        day: undefined,
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_DAY, max: VALID_DAY});
    });
    test('should raise an error asking for 4 digits, if year is only 1 digit', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2',
        month: '12',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: VALID_FOUR_DIGIT_YEAR});
    });
    test;
    test('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '23',
        month: '12',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: VALID_FOUR_DIGIT_YEAR});
    });
    test('should raise an error asking for 4 digits, if year is only 3 digits', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '202',
        month: '12',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: VALID_FOUR_DIGIT_YEAR});
    });
    test('should raise an error if date in the future', async () => {
      //Given
      const todayFormatted = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2999',
        month: '12',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: VALID_DATE_IN_PAST + todayFormatted});
    });
    test('should raise an error if month greater than 12', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '13',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_MONTH});
    });
    test('should raise an error if month less than 1', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '0',
        day: '1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_MONTH});
    });
    test('should raise an error if day greater than 31', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '12',
        day: '32',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: VALID_DAY});
    });
    test('should raise an error if day less than 1', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '12',
        day: '-1',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: VALID_DAY});
    });
    test('should raise an error if date is invalid', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2022',
        month: '2',
        day: '31',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({isDate: VALID_DATE});
    });
    test('should not raise an error if date in past', async () => {
      //Given
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if today specified for date', async () => {
      //Given
      const today: Date = new Date(Date.now());
      const todayFormatted = today.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: today.getFullYear().toString(),
        month: (today.getMonth() + 1).toString(),
        day: today.getDate().toString(),
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: VALID_DATE_IN_PAST + todayFormatted});
    });
    test('should not raise an error if yesterday specified for date', async () => {
      //Given
      const yesterday: Date = new Date(Date.now() - 1000 * 60 * 60 * 24);
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: yesterday.getFullYear().toString(),
        month: (yesterday.getMonth() + 1).toString(),
        day: yesterday.getDate().toString(),
        text: 'text',
      });
      //When
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
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
        howMuchHaveYouPaidService.getHowMuchHaveYouPaid('claimId', ResponseType.PART_ADMISSION)).rejects.toThrow(DRAFT_STORE_GET_ERROR);
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
        howMuchHaveYouPaidService.saveHowMuchHaveYouPaid('claimId', new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION)).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
    });
  });
});
