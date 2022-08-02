import {HowMuchHaveYouPaid} from '../../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {Validator} from 'class-validator';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

const validator = new Validator();
describe('Partial Admit - How much have you paid? model', () => {
  describe('amount validation', () => {
    // totalClaimAmount is £110
    it('should return errors when no input is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: undefined,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isDefined).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when input 0 is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: 0,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when more than 2 decimals provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: 10.123,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isNumber).toBe(TestMessages.VALID_TWO_DECIMAL_NUMBER);
    });
    it('should return errors when negative amount is provided', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: -110,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.min).toBe(TestMessages.ENTER_VALID_AMOUNT);
    });
    it('should return errors when provided amount is bigger than Claim amount', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: 999999999999999,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.equalOrLessToPropertyValue).toBe(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
    });
    it('should return no errors when provided amount is less than Claim amount', () => {
      //Given
      const form = new HowMuchHaveYouPaid({
        amount: 50,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '31',
        text: 'text',
      });
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(0);
    });
  });
});
