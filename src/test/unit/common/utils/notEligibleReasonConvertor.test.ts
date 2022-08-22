import {convertToNotEligibleReason} from  '../../../../main/common/utils/notEligibleReasonConvertor';
import {NotEligibleReason} from '../../../../main/common/form/models/eligibility/NotEligibleReason';

describe('NotEligibleReason converter', () => {
  it('should return undefined when reaosn is empty', () => {
    //When
    const result = convertToNotEligibleReason('');
    //Then
    expect(result).toBeUndefined();
  });
  it('should return undefined with unexpected reason', () => {
    //When
    const result = convertToNotEligibleReason('no reason');
    //Then
    expect(result).toBeUndefined();
  });
  it('should return CLAIM_ON_BEHALF', () => {
    //When
    const result = convertToNotEligibleReason('claim-on-behalf');
    //Then
    expect(result).toBe(NotEligibleReason.CLAIM_ON_BEHALF);
  });
  it('should return CLAIM_VALUE_NOT_KNOWN', () => {
    //When
    const result = convertToNotEligibleReason('claim-value-not-known');
    //Then
    expect(result).toBe(NotEligibleReason.CLAIM_VALUE_NOT_KNOWN);
  });
  it('should return CLAIM_VALUE_OVER_25000', () => {
    //When
    const result = convertToNotEligibleReason('claim-value-over-25000');
    //Then
    expect(result).toBe(NotEligibleReason.CLAIM_VALUE_OVER_25000);
  });
  it('should return UNDER_18', () => {
    //When
    const result = convertToNotEligibleReason('under-18');
    //Then
    expect(result).toBe(NotEligibleReason.UNDER_18);
  });
  it('should return UNDER_18_DEFENDANT', () => {
    //When
    const result = convertToNotEligibleReason('under-18-defendant');
    //Then
    expect(result).toBe(NotEligibleReason.UNDER_18_DEFENDANT);
  });
  it('should return MULTIPLE_CLAIMANTS', () => {
    //When
    const result = convertToNotEligibleReason('multiple-claimants');
    //Then
    expect(result).toBe(NotEligibleReason.MULTIPLE_CLAIMANTS);
  });
  it('should return MULTIPLE_DEFENDANTS', () => {
    //When
    const result = convertToNotEligibleReason('multiple-defendants');
    //Then
    expect(result).toBe(NotEligibleReason.MULTIPLE_DEFENDANTS);
  });
  it('should return HELP_WITH_FEES', () => {
    //When
    const result = convertToNotEligibleReason('help-with-fees');
    //Then
    expect(result).toBe(NotEligibleReason.HELP_WITH_FEES);
  });
  it('should return HELP_WITH_FEES_REFERENCE', () => {
    //When
    const result = convertToNotEligibleReason('help-with-fees-reference');
    //Then
    expect(result).toBe(NotEligibleReason.HELP_WITH_FEES_REFERENCE);
  });
  it('should return CLAIMANT_ADDRESS', () => {
    //When
    const result = convertToNotEligibleReason('claimant-address');
    //Then
    expect(result).toBe(NotEligibleReason.CLAIMANT_ADDRESS);
  });
  it('should return DEFENDANT_ADDRESS', () => {
    //When
    const result = convertToNotEligibleReason('defendant-address');
    //Then
    expect(result).toBe(NotEligibleReason.DEFENDANT_ADDRESS);
  });
  it('should returnGOVERNMENT_DEPARTMENT', () => {
    //When
    const result = convertToNotEligibleReason('government-department');
    //Then
    expect(result).toBe(NotEligibleReason.GOVERNMENT_DEPARTMENT);
  });
  it('should return CLAIM_IS_FOR_TENANCY_DEPOSIT', () => {
    //When
    const result = convertToNotEligibleReason('claim-is-for-tenancy-deposit');
    //Then
    expect(result).toBe(NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
  });
});
