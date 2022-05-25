import {Carer} from '../../../../../../main/common/form/models/statementOfMeans/carer';
import {Validator} from 'class-validator';
import {VALID_YES_NO_OPTION} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

const validator = new Validator();
describe('Carer validation', () => {
  it('should have errors when option is undefined', () => {
    //Given
    const carer = new Carer();
    //When
    const errors = validator.validateSync(carer);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0]?.constraints?.isDefined).toBe(VALID_YES_NO_OPTION);
  });
  it('should not have errors when option is selected', () => {
    //Given
    const paymentOption = new Carer(YesNo.YES);
    //When
    const errors = validator.validateSync(paymentOption);
    //Then
    expect(errors.length).toBe(0);
  });
});
