import {
  getFixedCost,
  getTotalAmountWithInterest,
  getTotalAmountWithInterestAndFees,
  isFullAmountReject,
} from '../../../main/modules/claimDetailsService';
import {convertToPoundsFilter} from '../../../main/common/utils/currencyFormat';
import {deepCopy} from '../../utils/deepCopy';
import {Claim} from '../../../main/common/models/claim';
import {createClaimWithBasicRespondentDetails} from '../../utils/mockClaimForCheckAnswers';
import {Party} from '../../../main/common/models/party';
import {ResponseType} from '../../../main/common/form/models/responseType';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import nock from 'nock';
import config from 'config';
import {FixedCosts} from 'form/models/claimDetails';

const civilServiceUrl = config.get<string>('services.civilService.url');

describe('Claim Details service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  describe('getTotalAmountWithInterestAndFees', () => {
    const caseData = mockClaim.case_data;

    it('should return total claim amount including fees and interest', async () => {
      //when
      const claim = {
        totalClaimAmount: 110,
        hasInterest: () => true,
        interest: { interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST, totalInterest: { amount: 90 } },
        claimFee: {
          code: 'FEE0204',
          version: 4,
          calculatedAmountInPence: 7000,
        },
        isInterestFromASpecificDate: () => false,
      };
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .reply(200, claim.interest.totalInterest.amount.toString());

      const totalAmount = await getTotalAmountWithInterestAndFees(claim as Claim);
      //Then
      expect(totalAmount).toEqual(claim.totalClaimAmount + claim.interest.totalInterest.amount + convertToPoundsFilter(claim.claimFee.calculatedAmountInPence));
    });

    it('should return total claim amount including fees', async () => {
      //when
      const claimWithoutInterest = deepCopy(caseData);
      claimWithoutInterest.totalInterest = 0;
      claimWithoutInterest['hasInterest'] = () => false;
      const totalAmount = await getTotalAmountWithInterestAndFees(claimWithoutInterest);
      //Then
      expect(totalAmount).toEqual(caseData.totalClaimAmount + convertToPoundsFilter(caseData.claimFee.calculatedAmountInPence));
    });
  });

  describe('getTotalAmountWithInterest', () => {
    const caseData = mockClaim.case_data;

    it('should return total claim amount including interest', async () => {
      //when
      const claim = {
        totalClaimAmount: 110,
        hasInterest: () => true,
        interest: { interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST, totalInterest: { amount: 90 } },
        claimFee: {
          code: 'FEE0204',
          version: 4,
          calculatedAmountInPence: 7000,
        },
        isInterestFromASpecificDate: () => false,
      };
      nock(civilServiceUrl)
        .post('/fees/claim/calculate-interest')
        .reply(200, claim.interest.totalInterest.amount.toString());

      const totalAmount = await getTotalAmountWithInterest(claim as Claim);
      //Then
      expect(totalAmount).toEqual(claim.totalClaimAmount + claim.interest.totalInterest.amount);
    });

    it('should return total claim amount without interest', async () => {
      //when
      const claimWithoutInterest = deepCopy(caseData);
      claimWithoutInterest.totalInterest = 0;
      claimWithoutInterest['hasInterest'] = () => false;
      const totalAmount = await getTotalAmountWithInterest(claimWithoutInterest);
      //Then
      expect(totalAmount).toEqual(caseData.totalClaimAmount);
    });
  });

  describe('isFullAmountReject', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return false if respondent responseType is FULL_ADMISSION', () => {
      expect(isFullAmountReject(claim)).toBe(false);
    });

    it('should return true if respondent responseType is PART_ADMISSION', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      expect(isFullAmountReject(claim)).toBe(true);
    });

    it('should return true if respondent responseType is FULL_DEFENCE', () => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      expect(isFullAmountReject(claim)).toBe(true);
    });
  });

  describe('isFullAmountReject', () => {
    it('fix cost is claimed', async () => {
      const claim = new Claim();
      claim.isLRClaimant = () => true;
      claim.fixedCosts = <FixedCosts> {};
      claim.fixedCosts.fixedCostAmount = '10000';
      claim.fixedCosts.claimFixedCosts = 'Yes';
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeTruthy();
      expect(fixedCost).toEqual(100);
    });

    it('ccj fix cost is claimed', async () => {
      const claim = new Claim();
      claim.isLRClaimant = () => true;
      claim.fixedCosts = <FixedCosts> {};
      claim.fixedCosts.fixedCostAmount = '10000';
      claim.fixedCosts.claimFixedCosts = 'Yes';
      claim.ccjJudgmentFixedCostAmount = '15000';
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeTruthy();
      expect(fixedCost).toEqual(150);
    });

    it('ccj fix cost is undefined', async () => {
      const claim = new Claim();
      claim.isLRClaimant = () => true;
      claim.fixedCosts = <FixedCosts> {};
      claim.fixedCosts.fixedCostAmount = '10000';
      claim.fixedCosts.claimFixedCosts = 'Yes';
      claim.ccjJudgmentFixedCostAmount = undefined;
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeTruthy();
      expect(fixedCost).toEqual(100);
    });

    it('ccj fix cost is zero', async () => {
      const claim = new Claim();
      claim.isLRClaimant = () => true;
      claim.fixedCosts = <FixedCosts> {};
      claim.fixedCosts.fixedCostAmount = '10000';
      claim.fixedCosts.claimFixedCosts = 'Yes';
      claim.ccjJudgmentFixedCostAmount = '0';
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeTruthy();
      expect(fixedCost).toEqual(100);
    });

    it('fixed cost is undefined', async () => {
      const claim = new Claim();
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeUndefined();
    });

    it('no fixed cost is claimed', async () => {
      const claim = new Claim();
      claim.fixedCosts = <FixedCosts> {};
      claim.fixedCosts.claimFixedCosts = 'No';
      const fixedCost = await getFixedCost(claim);
      expect(fixedCost).toBeUndefined();
    });

  });
});
