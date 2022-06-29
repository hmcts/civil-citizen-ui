import {getTotalAmountWithInterestAndFees, isFullAmountReject} from '../../../main/modules/claimDetailsService';
import {convertToPoundsFilter} from '../../../main/common/utils/currencyFormat';
import {deepCopy} from '../../utils/deepCopy';
import {Claim} from '../../../main/common/models/claim';
import {createClaimWithBasicRespondentDetails} from '../../utils/mockClaimForCheckAnswers';
import {Respondent} from '../../../main/common/models/respondent';
import {ResponseType} from '../../../main/common/form/models/responseType';

describe('Claim Details service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  describe('getTotalAmountWithInterestAndFees', () => {
    const caseData = mockClaim.case_data;

    it('should return total claim amount including fees and interest', () => {
      //when
      const totalAmount = getTotalAmountWithInterestAndFees(caseData);
      //Then
      expect(totalAmount).toEqual(caseData.totalClaimAmount + caseData.totalInterest + convertToPoundsFilter(caseData.claimFee.calculatedAmountInPence));
    });

    it('should return total claim amount including fees', () => {
      //when
      const claimWithoutInterest = deepCopy(caseData);
      claimWithoutInterest.totalInterest = 0;
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
      claim.respondent1 = new Respondent();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      expect(isFullAmountReject(claim)).toBe(true);
    });

    it('should return true if respondent responseType is FULL_DEFENCE', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      expect(isFullAmountReject(claim)).toBe(true);
    });
  });
});
