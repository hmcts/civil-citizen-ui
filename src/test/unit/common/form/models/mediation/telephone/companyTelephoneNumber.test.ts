import { CompanyTelephoneNumber } from '../../../../../../../main/common/form/models/mediation/telephone/companyTelephoneNumber';
import { Validator } from 'class-validator';
import { YesNo } from '../../../../../../../main/common/form/models/yesNo';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  const validator = new Validator();
  const validPhoneNumber = '012345678901234567890123456789';
  const inValidPhoneNumber = '0123456789012345678901234567890';
  const validName = 'David';
  const inValidName = 'Daviddaviddaviddaviddaviddavido';
  it('should have errors when option is not selected', () => {
    //Given
    const form = new CompanyTelephoneNumber();
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe(TestMessages.VALID_YES_NO_SELECTION);
  });
  it('should have errors when yes is an option, but no telephone number is provided', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.YES);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe(TestMessages.PHONE_NUMBER_REQUIRED);
  });
  it('should have errors when yes is an option but a long telephone number is provided', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.YES);
    form.mediationPhoneNumberConfirmation = inValidPhoneNumber;
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.maxLength).toBe(TestMessages.TEXT_TOO_LONG);
  });
  it('should have no errors when yes is an option but a telephone number is provided', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.YES);
    form.mediationPhoneNumberConfirmation = validPhoneNumber;
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
  it('should have errors when no is an option, but no other thing provided', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.NO);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(2);
    expect(errors[0].constraints?.isDefined).toBe(TestMessages.NAME_REQUIRED);
    expect(errors[1].constraints?.isDefined).toBe(TestMessages.PHONE_NUMBER_REQUIRED);
  });
  it('should have errors when no is an option, contact number is provided but no contact name', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.NO);
    form.mediationPhoneNumber = validPhoneNumber;
    //When
    const errors = validator.validateSync(form);
    
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe(TestMessages.NAME_REQUIRED);
  });
  it('should have errors when no is an option, contact name is provided but no contact number', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.NO);
    form.mediationContactPerson = validName;
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBe(TestMessages.PHONE_NUMBER_REQUIRED);
  });
  it('should have errors when no is an option but both contact name and contact number are too long', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.NO, inValidPhoneNumber, inValidName);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(2);
    expect(errors[0].constraints?.maxLength).toBe(TestMessages.TEXT_TOO_LONG);
    expect(errors[1].constraints?.maxLength).toBe(TestMessages.TEXT_TOO_LONG);
  });
  it('should have no errors when no is an option when both contact name and number is provided as valid', () => {
    //Given
    const form = new CompanyTelephoneNumber(YesNo.NO, validPhoneNumber, validName);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
});
