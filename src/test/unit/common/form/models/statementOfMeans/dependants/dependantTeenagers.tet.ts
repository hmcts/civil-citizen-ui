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
});
