import {request} from 'express';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {getClaimantSuggestedInstalmentsForm, getClaimantSuggestedInstalmentsPlan} from 'services/features/claimantResponse/claimantSuggestedInstalmentsService';

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
  });
});
