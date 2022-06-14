import {getTotalAmountWithInterestAndFees} from '../../../main/modules/claimDetailsService';
import {convertToPoundsFilter} from '../../../main/common/utils/currencyFormat';
import {deepCopy} from '../../utils/deepCopy';

describe('Claim Details service', () => {
  const mockClaim = require('../../utils/mocks/civilClaimResponseMock.json');
  describe('getTotalAmountWithInterestAndFees', () => {
    const caseData = mockClaim.case_data;

    it('should return total claim amount inculding fees and interest', () => {
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
});
