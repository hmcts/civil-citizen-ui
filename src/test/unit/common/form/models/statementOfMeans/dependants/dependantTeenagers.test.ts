import {
  DependantTeenagers,
} from '../../../../../../../main/common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {Validator} from 'class-validator';


describe('Dependant Teenagers form validation', () => {
  const validator = new Validator();
  it('should have errors when value is more than maxvalue', () => {
    //Given
    const form = new DependantTeenagers(22, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).not.toBeUndefined();
    expect(errors[0].constraints?.equalOrLessToPropertyValue).not.toBeUndefined();
  });
  it('should have errors when value is not defined', () => {
    //Given
    const form = new DependantTeenagers(undefined, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).not.toBeUndefined();
    expect(errors[0].constraints?.isDefined).not.toBeUndefined();
  });
  it('should have errors when value is not an integer', () => {
    //Given
    const form = new DependantTeenagers(0.1, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).not.toBeUndefined();
    expect(errors[0].constraints?.isNumber).not.toBeUndefined();
  });
  it('should have errors when value is negative', () => {
    //Given
    const form = new DependantTeenagers(-1, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).not.toBeUndefined();
    expect(errors[0].constraints?.min).not.toBeUndefined();
  });
  it('should not have errors when value is 0', () => {
    //Given
    const form = new DependantTeenagers(0, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
  it('should not have errors when value is less then max value', () => {
    //Given
    const form = new DependantTeenagers(0, 3);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
});
