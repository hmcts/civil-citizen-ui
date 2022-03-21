import {Validator} from 'class-validator';
import {Disability} from '../../../../../../main/common/form/models/statementOfMeans/disability';

describe('Citizen disability radio validation', () => {
  const validator = new Validator();
  it('should have errors when disability is not specified', () => {
    //Given
    const disability = new Disability();
    //When
    const result = validator.validateSync(disability);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow yes option', () => {
    //Given
    const disability = new Disability();
    disability.option = 'yes';
    //When
    const result = validator.validateSync(disability);
    //Then
    expect(result.length).toBe(0);
  });
  it('should have error when other option', () => {
    //Given
    const disability = new Disability();
    disability.option = 'True';
    //When
    const result = validator.validateSync(disability);
    //Then
    expect(result).not.toBeNull();
  });
  it('should allow no option', () => {
    //Given
    const disability = new Disability();
    disability.option = 'no';
    //When
    const result = validator.validateSync(disability);
    //Then
    expect(result.length).toBe(0);
  });
});

