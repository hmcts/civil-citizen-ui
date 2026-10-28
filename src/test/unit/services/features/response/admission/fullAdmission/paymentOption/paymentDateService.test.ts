import {paymentDateService} from 'services/features/response/admission/fullAdmission/paymentOption/paymentDateService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {GenericForm} from 'form/models/genericForm';
import {mockClaim} from '../../../../../../../utils/mockClaim';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {PartialAdmission} from 'models/partialAdmission';
import {FullAdmission} from 'models/fullAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim | Record<string, unknown>) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

let paymentDate = new PaymentDate(undefined, undefined, undefined);
let form = new GenericForm<PaymentDate>(new PaymentDate());

describe('Payment Date service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Serialisation', () => {
    it('should keep the form input values unchanged after validation', async () => {
      const paymentDate = new PaymentDate('2040', '1', '1');
      expect(paymentDate.day).toBe(1);
      expect(paymentDate.month).toBe(1);
      expect(paymentDate.year).toBe(2040);
    });
    it('should keep the form input values unchanged after validation', async () => {
      const paymentDate = new PaymentDate('--', '-', '&');
      expect(isNaN(paymentDate.day)).toBeTruthy();
      expect(isNaN(paymentDate.month)).toBeTruthy();
      expect(isNaN(paymentDate.year)).toBeTruthy();
    });
  });

  describe('get and save PaymentDate', () => {
    it('should return undefined when nothing retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const paymentDate = await paymentDateService.getPaymentDate(mockReq, ResponseType.FULL_ADMISSION);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(paymentDate).toBeUndefined();
    });

    it('should return PaymentDate when full admission date retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(mockClaim);

      const paymentDate = await paymentDateService.getPaymentDate(mockReq, ResponseType.FULL_ADMISSION);
      let expected: PaymentDate;
      if (mockClaim.fullAdmission?.paymentIntention?.paymentDate) {
        const year = mockClaim.fullAdmission.paymentIntention.paymentDate.getFullYear();
        const month = mockClaim.fullAdmission.paymentIntention.paymentDate.getMonth() + 1;
        const day = mockClaim.fullAdmission.paymentIntention.paymentDate.getDate();
        expected = new PaymentDate(year.toString(), month.toString(), day.toString());
      }

      expect(paymentDate).toEqual(expected);
    });

    it('should return PaymentDate when partial admission date retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(mockClaim);

      const paymentDate = await paymentDateService.getPaymentDate(mockReq, ResponseType.PART_ADMISSION);
      let expected: PaymentDate;
      if (mockClaim.partialAdmission?.paymentIntention?.paymentDate) {
        const year = mockClaim.partialAdmission.paymentIntention.paymentDate.getFullYear();
        const month = mockClaim.partialAdmission.paymentIntention.paymentDate.getMonth() + 1;
        const day = mockClaim.partialAdmission.paymentIntention.paymentDate.getDate();
        expected = new PaymentDate(year.toString(), month.toString(), day.toString());
      }

      expect(paymentDate).toEqual(expected);
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(paymentDateService.savePaymentDate(mockReq, new Date(), ResponseType.FULL_ADMISSION))
        .rejects.toThrow('[paymentDateService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save paymentDate for full admission', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dateNow = new Date('2030-01-15');

      await paymentDateService.savePaymentDate(mockReq, dateNow, ResponseType.FULL_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          fullAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({paymentDate: dateNow}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should add payment intention when partial admission already defined', async () => {
      const claim = new Claim();
      claim.partialAdmission = {foo: 'blah'} as unknown as PartialAdmission;
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dateNow = new Date('2030-01-15');

      await paymentDateService.savePaymentDate(mockReq, dateNow, ResponseType.PART_ADMISSION);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.partialAdmission.paymentIntention.paymentDate).toEqual(dateNow);
    });

    it('should initialise partial admission when not defined', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dateNow = new Date('2030-01-15');

      await paymentDateService.savePaymentDate(mockReq, dateNow, ResponseType.PART_ADMISSION);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({paymentDate: dateNow}),
          }),
        }),
        'draft-123',
      );
    });

    it('should preserve payment option when recreating payment intention', async () => {
      const claim = new Claim();
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = 'BY_SET_DATE' as never;
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dateNow = new Date('2030-01-15');

      await paymentDateService.savePaymentDate(mockReq, dateNow, ResponseType.FULL_ADMISSION);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.fullAdmission.paymentIntention.paymentOption).toBe('BY_SET_DATE');
      expect(savedClaim.fullAdmission.paymentIntention.paymentDate).toEqual(dateNow);
    });
  });

  describe('Validation', () => {
    it('should raise an error if nothing specified for date', async () => {
      paymentDate = new PaymentDate(undefined, undefined, undefined);
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(3);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
      expect(form.getErrors()[1].property).toBe('month');
      expect(form.getErrors()[1].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
      expect(form.getErrors()[2].property).toBe('year');
      expect(form.getErrors()[2].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
    });
    it('should raise an error if no year', async () => {
      paymentDate = new PaymentDate(undefined, '12', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_YEAR'});
    });
    it('should raise an error if no month', async () => {
      paymentDate = new PaymentDate('9999', undefined, '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH', max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if no day', async () => {
      paymentDate = new PaymentDate('9999', '12', undefined);
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY', max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error asking for 4 digits, if year is only 1 digit', async () => {
      paymentDate = new PaymentDate('2', '12', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR'});
    });
    it('should raise an error asking for 4 digits, if year is only 2 digits', async () => {
      paymentDate = new PaymentDate('23', '12', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an error asking for 4 digits, if year is only 3 digits', async () => {
      paymentDate = new PaymentDate('202', '12', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('year');
      expect(form.getErrors()[0].constraints).toEqual({
        OptionalDateFourDigitValidator: 'ERRORS.VALID_FOUR_DIGIT_YEAR',
      });
    });
    it('should raise an error if date in the past', async () => {
      paymentDate = new PaymentDate('1990', '12', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({
        customDate: 'ERRORS.VALID_DATE_NOT_IN_PAST',
      });
    });
    it('should raise an error if month greater than 12', async () => {
      paymentDate = new PaymentDate('2040', '13', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if month less than 1', async () => {
      paymentDate = new PaymentDate('2040', '0', '1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('month');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_MONTH'});
    });
    it('should raise an error if day greater than 31', async () => {
      paymentDate = new PaymentDate('2040', '12', '32');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({max: 'ERRORS.VALID_DAY'});
    });
    it('should raise an error if day less than 1', async () => {
      paymentDate = new PaymentDate('2040', '12', '-1');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('day');
      expect(form.getErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_DAY'});
    });
    it('should not raise an error if date in future', async () => {
      paymentDate = new PaymentDate('9999', '12', '31');
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if yesterday specified for date', async () => {
      const yesterday: Date = new Date(Date.now() - 1000 * 60 * 60 * 24);
      paymentDate = new PaymentDate(yesterday.getFullYear().toString(), (yesterday.getMonth() + 1).toString(), yesterday.getDate().toString());
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('date');
      expect(form.getErrors()[0].constraints).toEqual({customDate: 'ERRORS.VALID_DATE_NOT_IN_PAST'});
    });
    it('should not raise an error if today specified for date', async () => {
      const today: Date = new Date(Date.now());
      paymentDate = new PaymentDate(today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());
      form = new GenericForm<PaymentDate>(paymentDate);
      await form.validate();
      expect(form.getErrors().length).toBe(0);
    });
  });

  describe('Exception Handling', () => {
    it('should throw error when retrieving data from draft store fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        paymentDateService.getPaymentDate(mockReq, ResponseType.FULL_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when saving data to draft store fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        paymentDateService.savePaymentDate(mockReq, new Date(), ResponseType.FULL_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
