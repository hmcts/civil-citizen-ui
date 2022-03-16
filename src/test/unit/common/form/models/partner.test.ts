import {Validator} from 'class-validator';
import {Partner} from '../../../../../main/common/form/models/statementOfMeans/partner';

describe('Citizen partner age radio validation', () => {
  const validator = new Validator();
  it('should have errors when disability is not specified', () => {
    //Given
    const partner = new Partner();
    //When
    const result = validator.validateSync(partner);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow yes option', () => {
    //Given
    const partner = new Partner();
    partner.option = 'yes';
    //When
    const result = validator.validateSync(partner);
    //Then
    expect(result.length).toBe(0);
  });
  it('should have error when other option', () => {
    //Given
    const partner = new Partner();
    partner.option = 'True';
    //When
    const result = validator.validateSync(partner);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow no option', () => {
    //Given
    const partner = new Partner();
    partner.option = 'no';
    //When
    const result = validator.validateSync(partner);
    //Then
    expect(result.length).toBe(0);
  });
});
