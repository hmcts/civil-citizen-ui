import {Claim} from '../../../../main/common/models/claim';
import {InterestClaimUntilType, InterestClaimFromType, InterestClaimOptions, SameRateInterestType} from '../../../../main/common/form/models/claimDetails';
import civilClaimResponseApplicantCompany from '../../../utils/mocks/civilClaimResponseApplicantCompanyMock.json';
import civilClaimResponseApplicantIndividual from '../../../utils/mocks/civilClaimResponseApplicanIndividualMock.json';

describe('Claim isInterestClaimUntilSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_SETTLED_OR_JUDGEMENT_MADE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});
describe('Claim isInterestFromClaimSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestFromASpecificDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestClaimOptionsSameRateInterest', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.SAME_RATE_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.BREAK_DOWN_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isSameRateTypeEightPercent', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim get claimant and defendant names by type', () => {
  const claimCompany =  Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantCompany)).case_data);
  const claimIndividual =  Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantIndividual)).case_data);
  it('should return claimantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getClaimantName();
    //Then
    expect(result).toBe('Mr. Jan Clark');
  });
  it('should return defendantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getDefendantName();
    //Then
    expect(result).toBe('Mr. Joe Doe');
  });
  it('should return claimantName for COMPANY', () => {
    //When
    const result = claimCompany.getClaimantName();
    //Then
    expect(result).toBe('Version 1');
  });
  it('should return defendantName for COMPANY', () => {
    //When
    const result = claimCompany.getDefendantName();
    //Then
    expect(result).toBe('Google');
  });
});