import {Validator} from 'class-validator';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../../main/common/form/models/genericYesNo';

const validator = new Validator();
describe('Carer validation', () => {
  it('should have errors when option is undefined', () => {
    //Given
    const carer = new GenericYesNo();
    //When
    const errors = validator.validateSync(carer);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0]?.constraints?.isDefined).toBe('ERRORS.VALID_YES_NO_OPTION');
  });
  it('should not have errors when option is selected', () => {
    //Given
    const paymentOption = new GenericYesNo(YesNo.YES);
    //When
    const errors = validator.validateSync(paymentOption);
    //Then
    expect(errors.length).toBe(0);
  });
});
