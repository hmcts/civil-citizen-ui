import howMuchHaveYouPaidService
  from '../../../../../../../main/services/features/response/admission/howMuchHaveYouPaidService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {HowMuchHaveYouPaid} from '../../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {mockClaim} from '../../../../../../utils/mockClaim';
import {ResponseType} from '../../../../../../../main/common/form/models/responseType';
import {Claim} from '../../../../../../../main/common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

let howMuchHaveYouPaid = new HowMuchHaveYouPaid();
let form = new GenericForm<HowMuchHaveYouPaid>(new HowMuchHaveYouPaid());

describe('HowMuchHaveYouPaid service', () => {
  describe('Serialisation', () => {
    it('should keep the form input values unchanged after validation', async () => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(20, 40, '2040', '1', '1', 'I paid half');
      expect(howMuchHaveYouPaid.amount).toBe(20);
      expect(howMuchHaveYouPaid.totalClaimAmount).toBe(40);
      expect(howMuchHaveYouPaid.day).toBe(1);
      expect(howMuchHaveYouPaid.month).toBe(1);
      expect(howMuchHaveYouPaid.year).toBe(2040);
      expect(howMuchHaveYouPaid.text).toBe('I paid half');
    });
    it('should keep the form input values unchanged after validation', async () => {
      const howMuchHaveYouPaid = howMuchHaveYouPaidService.buildHowMuchHaveYouPaid(0, 0, '&', '%', '$', undefined);
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

    it('should return empty HowMuchHaveYouPaid when nothing retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(mockReq, ResponseType.PART_ADMISSION);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(howMuchHaveYouPaid.amount).toBeUndefined();
      expect(howMuchHaveYouPaid.totalClaimAmount).toBeUndefined();
      expect(howMuchHaveYouPaid.year).toBeUndefined();
      expect(howMuchHaveYouPaid.month).toBeUndefined();
      expect(howMuchHaveYouPaid.day).toBeUndefined();
      expect(howMuchHaveYouPaid.date).toBeUndefined();
      expect(howMuchHaveYouPaid.text).toBeUndefined();
    });

    it('should return empty HowMuchHaveYouPaid when claim has no howMuchHaveYouPaid', async () => {
      mockGetResponseClaimById.mockResolvedValue({case_data: {}} as unknown as Claim);

      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(mockReq, ResponseType.PART_ADMISSION);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(howMuchHaveYouPaid.amount).toBeUndefined();
      expect(howMuchHaveYouPaid.totalClaimAmount).toBeUndefined();
      expect(howMuchHaveYouPaid.year).toBeUndefined();
      expect(howMuchHaveYouPaid.month).toBeUndefined();
      expect(howMuchHaveYouPaid.day).toBeUndefined();
      expect(howMuchHaveYouPaid.date).toBeUndefined();
      expect(howMuchHaveYouPaid.text).toBeUndefined();
    });

    it('should return HowMuchHaveYouPaid when HowMuchHaveYouPaid Partial Admission retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(mockClaim);

      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(mockReq, ResponseType.PART_ADMISSION);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(howMuchHaveYouPaid).not.toBeNull();
      expect(howMuchHaveYouPaid).toEqual(mockClaim?.partialAdmission?.howMuchHaveYouPaid);
    });

    it('should return HowMuchHaveYouPaid when HowMuchHaveYouPaid full Rejection retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(mockClaim);

      const howMuchHaveYouPaid = await howMuchHaveYouPaidService.getHowMuchHaveYouPaid(mockReq, ResponseType.FULL_DEFENCE);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(howMuchHaveYouPaid).not.toBeNull();
      expect(howMuchHaveYouPaid).toEqual(mockClaim?.rejectAllOfClaim?.howMuchHaveYouPaid);
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(mockReq, new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION))
        .rejects.toThrow('[howMuchHaveYouPaidService] no draft response found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save howMuchHaveYouPaid when claim has no howMuchHaveYouPaid', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(mockReq, new HowMuchHaveYouPaid({amount: 20}), ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            howMuchHaveYouPaid: expect.objectContaining({amount: 20}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save howMuchHaveYouPaid when claim in draft store', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(mockClaim as Claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(mockReq, new HowMuchHaveYouPaid({amount: 30}), ResponseType.PART_ADMISSION);

      expect(mockGetResponseDraft).toHaveBeenCalledWith(mockReq, caseId);
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            howMuchHaveYouPaid: expect.objectContaining({amount: 30}),
          }),
        }),
        'draft-123',
      );
    });

    it('should save howMuchHaveYouPaid to rejectAllOfClaim for full defence', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(mockReq, new HowMuchHaveYouPaid({amount: 40}), ResponseType.FULL_DEFENCE);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            howMuchHaveYouPaid: expect.objectContaining({amount: 40}),
          }),
        }),
        'draft-123',
      );
    });
  });

  describe('Validation', () => {
    it('should raise an error if nothing specified for date', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid();
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(5);
      expect(form.getErrors()[0].property).toBe('amount');
      expect(form.getErrors()[0].constraints).toEqual({
        isDefined: 'ERRORS.VALID_AMOUNT',
        isNumber: 'ERRORS.VALID_TWO_DECIMAL_NUMBER',
        min: 'ERRORS.VALID_AMOUNT',
      });
      expect(form.getErrors()[2].property).toBe('day');
      expect(form.getErrors()[2].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
      expect(form.getErrors()[3].property).toBe('month');
      expect(form.getErrors()[3].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
      expect(form.getErrors()[4].property).toBe('year');
      expect(form.getErrors()[4].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
      expect(form.getErrors()[1].property).toBe('text');
      expect(form.getErrors()[1].constraints).toEqual({isNotEmpty: 'ERRORS.ENTER_PAYMENT_EXPLANATION'});
    });
    it('should raise an error if no text', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2021',
        month: '12',
        day: '1',
        text: undefined,
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('text');
      expect(form.getErrors()[0].constraints).toEqual({isNotEmpty: 'ERRORS.ENTER_PAYMENT_EXPLANATION'});
    });
    it('should raise an error if no year', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: undefined,
        month: '12',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
    });
    it('should raise an error if no month', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '9999',
        month: undefined,
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if no day', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '9999',
        month: '12',
        day: undefined,
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error asking for 4 digits, if year is only 1 digit', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2',
        month: '12',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '23',
        month: '12',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error asking for 4 digits, if year is only 3 digits', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '202',
        month: '12',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error if date in the future', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2999',
        month: '12',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: 'ERRORS.VALID_DATE_IN_PAST'});
    });
    it('should raise an error if month greater than 12', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '13',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if month less than 1', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '0',
        day: '1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if day greater than 31', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '12',
        day: '32',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error if day less than 1', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2020',
        month: '12',
        day: '-1',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY' +
          '' +
          ''});
    });
    it('should raise an error if date is invalid', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2022',
        month: '2',
        day: '31',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({isDate:  'ERRORS.VALID_DATE'});
    });
    it('should not raise an error if date in past', async () => {
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if today specified for date', async () => {
      const today: Date = new Date(Date.now());
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: today.getFullYear().toString(),
        month: (today.getMonth() + 1).toString(),
        day: today.getDate().toString(),
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: 'ERRORS.VALID_DATE_IN_PAST'});
    });
    it('should not raise an error if yesterday specified for date', async () => {
      const yesterday: Date = new Date(Date.now() - 1000 * 60 * 60 * 24);
      howMuchHaveYouPaid = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 100,
        year: yesterday.getFullYear().toString(),
        month: (yesterday.getMonth() + 1).toString(),
        day: yesterday.getDate().toString(),
        text: 'text',
      });
      form = new GenericForm<HowMuchHaveYouPaid>(howMuchHaveYouPaid);
      await form.validate();
      expect(form.getErrors().length).toBe(0);
    });
  });

  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when retrieving data from draft store fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        howMuchHaveYouPaidService.getHowMuchHaveYouPaid(mockReq, ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when saving data to draft store fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        howMuchHaveYouPaidService.saveHowMuchHaveYouPaid(mockReq, new HowMuchHaveYouPaid(), ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
