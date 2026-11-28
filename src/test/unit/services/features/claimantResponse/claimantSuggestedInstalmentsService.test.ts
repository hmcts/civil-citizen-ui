import {request} from 'express';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { getClaimantSuggestedInstalmentsForm, getClaimantSuggestedInstalmentsPlan, updateDayErrorMsg } from 'services/features/claimantResponse/claimantSuggestedInstalmentsService';
import { ValidationError } from 'class-validator';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const TOTAL_CLAIM_AMOUNT = 1000;
const PAYMENT_AMOUNT = 100;
const REPAYMENT_FREQUENCY = 'WEEK';
const YEAR = '2024';
const MONTH = '02';
const DAY = '14';
const FIRST_PAYMENT_DATE = new Date('2024-02-14T00:00:00.000');
const claimId = '5129';

describe('Claiman Suggested Instalments Plan Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getclaimantSuggestedInstalmentsPlan', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getClaimantSuggestedInstalmentsPlan(claimId);
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.year).toBeUndefined();
    });

    it('should get empty form with total claim amount when suggested payment intention doesn`t exist, but total claim amount is defined', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
        claim.claimantResponse = new ClaimantResponse();
        return claim;
      });
      //When
      const form = await getClaimantSuggestedInstalmentsPlan(claimId);
      //Then
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should return populated form when data provided', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
        claim.claimantResponse = new ClaimantResponse();
        const repaymentPlan = {
          paymentAmount: PAYMENT_AMOUNT,
          repaymentFrequency: REPAYMENT_FREQUENCY,
          firstRepaymentDate: new Date(FIRST_PAYMENT_DATE),
        };
        claim.claimantResponse.suggestedPaymentIntention = {
          paymentOption: PaymentOptionType.INSTALMENTS,
          paymentDate: new Date(),
          repaymentPlan: repaymentPlan,
        };
        return claim;
      });
      //When
      const form = await getClaimantSuggestedInstalmentsPlan(claimId);
      //Then
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate.toDateString()).toBe('Wed Feb 14 2024');
    });

    it('should return an error on redis failure', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //When-Then
      await expect(getClaimantSuggestedInstalmentsPlan(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it.each([undefined, null, '', 'not-a-date', new Date(NaN)])('leaves unusable saved date %s blank without discarding amount or frequency', async savedDate => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = {
        paymentOption: PaymentOptionType.INSTALMENTS,
        repaymentPlan: {paymentAmount: PAYMENT_AMOUNT, repaymentFrequency: REPAYMENT_FREQUENCY, firstRepaymentDate: savedDate as Date},
      };
      mockGetCaseData.mockResolvedValue(claim);

      const form = await getClaimantSuggestedInstalmentsPlan(claimId);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect([form.getDayAsString(), form.getMonthAsString(), form.getYearAsString()]).toEqual(['', '', '']);
      expect(form.firstRepaymentDate).toBeUndefined();
      expect(claim.claimantResponse.suggestedPaymentIntention.repaymentPlan.firstRepaymentDate).toBe(savedDate);
    });

    it.each([
      {paymentAmount: PAYMENT_AMOUNT, repaymentFrequency: undefined},
      {paymentAmount: undefined, repaymentFrequency: REPAYMENT_FREQUENCY},
    ])('preserves partial plan amount $paymentAmount and frequency $repaymentFrequency independently of a valid date', async ({paymentAmount, repaymentFrequency}) => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = {
        paymentOption: PaymentOptionType.INSTALMENTS,
        repaymentPlan: {paymentAmount, repaymentFrequency, firstRepaymentDate: FIRST_PAYMENT_DATE},
      };
      mockGetCaseData.mockResolvedValue(claim);

      const form = await getClaimantSuggestedInstalmentsPlan(claimId);

      expect(form.paymentAmount).toBe(paymentAmount);
      expect(form.repaymentFrequency).toBe(repaymentFrequency);
      expect([form.day, form.month, form.year]).toEqual([14, 2, 2024]);
    });

    it.each([FIRST_PAYMENT_DATE, FIRST_PAYMENT_DATE.toISOString()])('restores valid saved date %s, including JSON cache strings', async savedDate => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = {
        paymentOption: PaymentOptionType.INSTALMENTS,
        repaymentPlan: {paymentAmount: PAYMENT_AMOUNT, repaymentFrequency: REPAYMENT_FREQUENCY, firstRepaymentDate: savedDate as Date},
      };
      mockGetCaseData.mockResolvedValue(claim);

      const form = await getClaimantSuggestedInstalmentsPlan(claimId);

      expect([form.day, form.month, form.year]).toEqual([14, 2, 2024]);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
    });
  });

  describe('getClaimantSuggestedInstalmentsForm', () => {
    it('should return empty form with empty claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const req = request;
      req.body = {
        paymentAmount: '',
        repaymentFrequency: '',
        year: '',
        month: '',
        day: '',
      };
      //When
      const form = await getClaimantSuggestedInstalmentsForm(req);
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should populate form with provided inputs', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
        return claim;
      });
      const req = request;
      req.body = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        year: YEAR,
        month: MONTH,
        day: DAY,
      };
      //When
      const form = await getClaimantSuggestedInstalmentsForm(req);
      //Then
      expect(form.totalClaimAmount).toBeTruthy();
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate.toDateString()).toBe('Wed Feb 14 2024');
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const req = request;
      //When-Then
      await expect(getClaimantSuggestedInstalmentsForm(req)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should update the error message for date', () => {
      const errors:ValidationError[] = [
        {
          target: {
            year: undefined,
            month: undefined,
            day: undefined,
            date: undefined,
          },
          value: undefined,
          property: 'day',
          children: [
          ],
          constraints: {
            max: 'ERRORS.VALID_DAY',
            min: 'ERRORS.VALID_DAY',
          },
        },
        {
          target: {
            year: undefined,
            month: undefined,
            day: undefined,
            date: undefined,
          },
          value: undefined,
          property: 'month',
          children: [
          ],
          constraints: {
            max: 'ERRORS.VALID_MONTH',
            min: 'ERRORS.VALID_MONTH',
          },
        },
        {
          target: {
            year: undefined,
            month: undefined,
            day: undefined,
            date: undefined,
          },
          value: undefined,
          property: 'year',
          children: [
          ],
          constraints: {
            max: 'ERRORS.VALID_YEAR',
          },
        },
      ];
      updateDayErrorMsg(errors);
      expect(errors[0].constraints.max).toEqual('ERRORS.VALID_DAY_VARIATION1');
    });
  });
});
