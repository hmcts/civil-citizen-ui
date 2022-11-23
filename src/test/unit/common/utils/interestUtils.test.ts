import {getInterestDetails, getInterestDateOrIssueDate, getInterestRate} from 'common/utils/interestUtils';
import {Claim} from 'common/models/claim';
import {deepCopy} from '../../../utils/deepCopy';
import {mockClaim as mockResponse} from '../../../utils/mockClaim';
import {YesNo} from 'common/form/models/yesNo';
import {InterestClaimFromType, SameRateInterestType} from 'common/form/models/claimDetails';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';

describe('Interest Utils', () => {
  const claim: Claim = Object.assign(new Claim(), deepCopy(mockResponse));

  it('getInterestDetails should return undefined when interest is not requested', () => {
    //Given
    claim.claimInterest = YesNo.NO;

    //When
    const result = getInterestDetails(claim);
    //Then
    expect(result).toBeUndefined();
  });

  it('getInterestDateOrIssueDate should return submit date when InterestClaimFromType is selected claim submit date', () => {
    //Given
    claim.interest.interestClaimFrom  = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;

    //When
    const result = getInterestDateOrIssueDate(claim);
    //Then
    expect(result).toEqual(claim.submittedDate);
  });

  it('getInterestRate should return %8 interest rate when no different rate is selected', () => {
    //Given
    const claimWithSameInterestRate = deepCopy(claim);
    claimWithSameInterestRate.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
    claimWithSameInterestRate.interest.sameRateInterestSelection.sameRateInterestType = SameRateInterestType.SAME_RATE_INTEREST_8_PC;

    //When
    const result = getInterestRate(claim);
    //Then
    expect(result).toEqual(8);
  });

  it('getInterestRate should return different rate value when different interesst rate than %8 is selected', () => {
    //Given
    const DIFFERENT_INTEREST_RATE = 7;
    claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
    claim.interest.sameRateInterestSelection.differentRate = DIFFERENT_INTEREST_RATE;
    claim.interest.sameRateInterestSelection.sameRateInterestType = SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE;

    //When
    const result = getInterestRate(claim);
    //Then
    expect(result).toEqual(DIFFERENT_INTEREST_RATE);
  });
});
