import {
  OnTaxPayments,
} from '../../../../../../../../main/common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {Validator} from 'class-validator';
import {YES_NO_REQUIRED} from '../../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../../../../../../main/common/form/models/yesNo';

const validator = new Validator();
describe('on tax payment model', () => {
  describe('yes is option is selected', () => {
    it('should return true when option yes is selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES);
      //When
      const result = form.isOptionYesSelected();
      //Then
      expect(result).toBeTruthy();
    });
    it('should return false when no is selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.NO);
      //When
      const result = form.isOptionYesSelected();
      //Then
      expect(result).toBeFalsy();
    });
    it('should return false when nothing is selected', () => {
      //Given
      const form = new OnTaxPayments();
      //When
      const result = form.isOptionYesSelected();
      //Then
      expect(result).toBeFalsy();
    });
  });
  describe('getAmountYouOweAsString', () => {
    it('should return string 0 when amount you owe is 0', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES, 0);
      //When
      const result = form.getAmountYouOweAsString();
      //Then
      expect(result).toBe('');
    });
    it('should return empty string when amount you owe is undefined', () => {
      //Given
      const form = new OnTaxPayments();
      //When
      const result = form.getAmountYouOweAsString();
      //Then
      expect(result).toBe('');
    });
    it('should return empty string when amount you owe is NAN', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES, Number('abc'));
      //When
      const result = form.getAmountYouOweAsString();
      //Then
      expect(result).toBe('');
    });
    it('should return string 1.22 when amount you owe is 1.22', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES, 1.22);
      //When
      const result = form.getAmountYouOweAsString();
      //Then
      expect(result).toBe('1.22');
    });
  });
  describe('validation', () => {
    it('should return errors when yes or no option is not selected', () => {
      //Given
      const form = new OnTaxPayments();
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
      expect(errors[0].constraints?.isDefined).toBe(YES_NO_REQUIRED);
    });
    it('should not have errors when option no is selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.NO);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(0);
    });
    it('should have errors when option yes is selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(2);
    });
    it('should have errors when option option yes is selected amount owed not selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES, undefined, 'reason');
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
    });
    it('should have errors when option option yes is selected and reason not selected', () => {
      //Given
      const form = new OnTaxPayments(YesNo.YES, 2);
      //When
      const errors = validator.validateSync(form);
      //Then
      expect(errors?.length).toBe(1);
    });
  });


});
