import {
  WhyDoYouDisagree,
} from '../../../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Validator} from 'class-validator';

const validator = new Validator();
describe('Disagree reason validator', () => {
  it('should have errors when disagree is undefined', () => {
    //Given
    const whyDoYouDisagree = new WhyDoYouDisagree();
    //When
    const errors = validator.validateSync(whyDoYouDisagree);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe('ERRORS.VALID_DISAGREE_REASON_REQUIRED');
    expect(errors[0].constraints?.isNotEmpty).toBe('ERRORS.VALID_DISAGREE_REASON_REQUIRED');
    expect(errors[0].constraints?.maxLength).toBe('ERRORS.VALID_DISAGREE_REASON_REQUIRED');
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
