import {Validator} from 'class-validator';
import {RejectAllOfClaim} from '../../../../../main/common/form/models/rejectAllOfClaim';
import RejectAllOfClaimType from '../../../../../main/common/form/models/rejectAllOfClaimType';

describe('Citizen partner age radio validation', () => {
  const validator = new Validator();
  it('should have errors when rejectAllOfClaim is not specified', () => {
    //Given
    const rejectAllOfClaim = new RejectAllOfClaim();
    //When
    const result = validator.validateSync(rejectAllOfClaim);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow ALREADY_PAID option', () => {
    //Given
    const rejectAllOfClaim = new RejectAllOfClaim();
    rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
    //When
    const result = validator.validateSync(rejectAllOfClaim);
    //Then
    expect(result.length).toBe(0);
  });
  it('should have error when other option', () => {
    //Given
    const rejectAllOfClaim = new RejectAllOfClaim();
    rejectAllOfClaim.option = '';
    //When
    const result = validator.validateSync(rejectAllOfClaim);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow DISPUTE option', () => {
    //Given
    const rejectAllOfClaim = new RejectAllOfClaim();
    rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;
    //When
    const result = validator.validateSync(rejectAllOfClaim);
    //Then
    expect(result.length).toBe(0);
  });
  it('should allow COUNTER_CLAIM option', () => {
    //Given
    const rejectAllOfClaim = new RejectAllOfClaim();
    rejectAllOfClaim.option = RejectAllOfClaimType.COUNTER_CLAIM;
    //When
    const result = validator.validateSync(rejectAllOfClaim);
    //Then
    expect(result.length).toBe(0);
  });
});
