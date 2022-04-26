import {
  WhyDoYouDisagree,
} from '../../../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Validator} from 'class-validator';
import {
  VALID_DISAGREE_REASON_REQUIRED,
} from '../../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const validator = new Validator();
describe('Desagree reason validator', () => {
  it('should have errors when disagree is undefined', () => {
    //Given
    const whyDoYouDisagree = new WhyDoYouDisagree();
    //When
    const errors = validator.validateSync(whyDoYouDisagree);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe(VALID_DISAGREE_REASON_REQUIRED);
    expect(errors[0].constraints?.isNotEmpty).toBe(VALID_DISAGREE_REASON_REQUIRED);
    expect(errors[0].constraints?.maxLength).toBe(VALID_DISAGREE_REASON_REQUIRED);
  });
  it('should not have errors when paymentType is selected', () => {
    //Given
    const whyDoYouDisagree = new WhyDoYouDisagree('Test');
    //When
    const errors = validator.validateSync(whyDoYouDisagree);
    //Then
    expect(errors.length).toBe(0);
  });
});
