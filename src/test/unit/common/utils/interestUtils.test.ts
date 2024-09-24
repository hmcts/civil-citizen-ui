import {
  getInterestDetails,
  getInterestDateOrIssueDate,
  getInterestRate,
  calculateInterest,
  getInterestStartDate,
  calculateInterestToDate,
} from 'common/utils/interestUtils';
import { Claim } from 'models/claim';
import { deepCopy } from '../../../utils/deepCopy';
import { mockClaim as mockResponse } from '../../../utils/mockClaim';
import { YesNo } from 'form/models/yesNo';
import {InterestClaimFromType, InterestEndDateType, SameRateInterestType} from 'form/models/claimDetails';
import { InterestClaimOptionsType } from 'form/models/claim/interest/interestClaimOptionsType';
import { Interest } from 'common/form/models/interest/interest';
import { InterestStartDate } from 'common/form/models/interest/interestStartDate';
import { TotalInterest } from 'common/form/models/interest/totalInterest';

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
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;

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

  it('calculateInterest should return correct interest', () => {
    //Given
    const amount = 9000;
    const interest = 8;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-09-24');

    //When
    const result = calculateInterest(amount, interest, startDate, endDate);

    //Then
    expect(result).toEqual(525.99);
  });

  it('getInterestStartDate should return new Date if InterestClaimFromType is FROM_CLAIM_SUBMIT_DATE', () => {
    //Given
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;

    //When
    const result = getInterestStartDate(claim);

    //Then
    expect(result.toLocaleDateString()).toEqual((new Date()).toLocaleDateString());
  });

  it('getInterestStartDate should return correct date if InterestClaimFromType is FROM_A_SPECIFIC_DATE', () => {
    //Given
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    claim.interest.interestStartDate = new InterestStartDate('20', '10', '2022', 'my reason');

    //When
    const result = getInterestStartDate(claim);

    //Then
    expect(result).toEqual(new Date('2022-10-20'));
  });

  it('calculateInterestToDate should return correct interest to date when BREAK_DOWN_INTEREST selected', () => {
    //Given
    const claim = new Claim();
    claim.totalClaimAmount = 6000;
    claim.interest = new Interest();
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    claim.interest.interestStartDate = new InterestStartDate('20', '10', '2022', 'my reason');

    claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
    claim.interest.totalInterest = new TotalInterest('200', 'test');

    //When
    const result = calculateInterestToDate(claim);

    //Then
    expect(result).toEqual(200);
  });

  it('calculateInterestToDate should return correct interest to date when SAME_RATE_INTEREST selected', () => {
    //Given
    const claim = new Claim();
    claim.totalClaimAmount = 6000;
    claim.interest = new Interest();
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);

    claim.interest.interestStartDate = new InterestStartDate(
      startDate.getDate().toString(),
      (startDate.getMonth() + 1).toString(),
      startDate.getFullYear().toString(),
      'my reason');
    claim.interest.sameRateInterestSelection = {
      sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
    };
    claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
    claim.interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;

    //When
    const result = calculateInterestToDate(claim);

    //Then
    expect(result).toEqual(14.52);
  });
});
