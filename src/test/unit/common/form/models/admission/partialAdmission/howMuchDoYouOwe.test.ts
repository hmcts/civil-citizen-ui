import {
  HowMuchDoYouOwe,
} from '../../../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {Validator} from 'class-validator';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

const validator = new Validator();
describe('Partial Admit - How much money do you admit you owe? model', () => {
  describe('validation', () => {
    // totalClaimAmount is £110
    it('should return errors when no input is provided', () => {
      //Given
      const form = new HowMuchDoYouOwe(undefined);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isDefined).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when input 0 is provided', () => {
      //Given
      const form = new HowMuchDoYouOwe(0);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when more than 2 decimals provided', () => {
      //Given
      const form = new HowMuchDoYouOwe(10.123);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isNumber ).toBe(TestMessages.VALID_TWO_DECIMAL_NUMBER);
    });
    it('should return errors when negative amount is provided', () => {
      //Given
      const form = new HowMuchDoYouOwe(-110);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when provided amount is bigger than Claim amount', () => {
      //Given
      const form = new HowMuchDoYouOwe(9999999999999, 110);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.equalOrLessToPropertyValue).toBe(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
    });
    it('should return errors when provided amount is equal to Claim amount', () => {
      //Given
      const form = new HowMuchDoYouOwe(110, 110);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.equalOrLessToPropertyValue).toBe(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
    });
  });
});
