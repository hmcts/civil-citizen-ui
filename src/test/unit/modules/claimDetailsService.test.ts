import {getTotalAmountWithInterestAndFees, isFullAmountReject} from '../../../main/modules/claimDetailsService';
import {convertToPoundsFilter} from '../../../main/common/utils/currencyFormat';
import {deepCopy} from '../../utils/deepCopy';
import {Claim} from '../../../main/common/models/claim';
import {createClaimWithBasicRespondentDetails} from '../../utils/mockClaimForCheckAnswers';
import {Party} from '../../../main/common/models/party';
import {ResponseType} from '../../../main/common/form/models/responseType';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';

describe('Claim Details service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  describe('getTotalAmountWithInterestAndFees', () => {
    const caseData = mockClaim.case_data;

    it('should return total claim amount including fees and interest', () => {
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
      };

      const totalAmount = getTotalAmountWithInterestAndFees(claim as Claim);
      //Then
      expect(totalAmount).toEqual(claim.totalClaimAmount + claim.interest.totalInterest.amount + convertToPoundsFilter(claim.claimFee.calculatedAmountInPence));
    });

    it('should return total claim amount including fees', () => {
      //when
      const claimWithoutInterest = deepCopy(caseData);
      claimWithoutInterest.totalInterest = 0;
      claimWithoutInterest['hasInterest'] = () => false;
      const totalAmount = getTotalAmountWithInterestAndFees(claimWithoutInterest);
      //Then
      expect(totalAmount).toEqual(caseData.totalClaimAmount + convertToPoundsFilter(caseData.claimFee.calculatedAmountInPence));
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
});
