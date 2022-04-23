import {
  HowMuchHaveYouPaid,
} from '../../../../../../../main/common/form/models/admission/partialAdmission/howMuchHaveYouPaid';
import {Validator} from 'class-validator';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';


const validator = new Validator();
describe('Partial Admit - How much have you paid? model', () => {
  describe('amount validation', () => {
    // totalClaimAmount is £110
    it('should return errors when no input is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid(undefined, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isDefined).toBe(TestMessages.VALID_AMOUNT);
    });
    it('should return errors when input 0 is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid(0, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min).toBe(TestMessages.VALID_AMOUNT);
    });
    it('should return errors when more than 2 decimals provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid(10.123, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isNumber ).toBe(TestMessages.VALID_TWO_DECIMAL_NUMBER);
    });
    it('should return errors when negative amount is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid(-110, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min ).toBe(TestMessages.VALID_AMOUNT);
    });
    it('should return errors when provided amount is bigger than Claim amount', () => {
      //Given
      const form = new HowMuchHaveYouPaid(999999999999999, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.equalOrLessToPropertyValue).toBe(TestMessages.AMOUNT_LESS_THEN_CLAIMED);
    });
    it('should return errors when provided amount is equal to Claim amount', () => {
      //Given
      const form = new HowMuchHaveYouPaid(110, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.equalOrLessToPropertyValue).toBe(TestMessages.AMOUNT_LESS_THEN_CLAIMED);
    });
    it('should return no errors when provided amount is less than Claim amount', () => {
      //Given
      const form = new HowMuchHaveYouPaid(50, 110, '2022', '1', '31', 'text');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(0);
    });
  });
});
