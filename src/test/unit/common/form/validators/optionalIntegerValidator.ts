import {OptionalIntegerValidator} from '../../../../../main/common/form/validators/optionalIntegerValidator';
import {ValidationArguments} from 'class-validator';



describe('OptionalIntegerValidator', () => {
  class DummyClass implements ValidationArguments {
    constraints: any[];
    object: object;
    property: string;
    targetName: string;
    value: any;
  }
  it('should return true for numeric input', async () => {
    //Given a valid input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '1232134234';
    //when input is validated
    const result = optionalIntegerValidator.validate(validNumericInput, new DummyClass());
    //then
    expect(result).toBeTruthy();
  });

  it('should return false for input with special characters', async () => {
    //Given input with special characters
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '+442342845452';
    //when
    const result = optionalIntegerValidator.validate(validNumericInput, new DummyClass());
    //then
    expect(result).toBeFalsy();
  });

  it('should return false for input with alphanumeric characters', async () => {
    //Given alphanumeric input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = 'sdfswsdfsdf';
    //when
    const result = optionalIntegerValidator.validate(validNumericInput, new DummyClass());
    //then
    expect(result).toBeFalsy();
  });

  it('should return true for null or empty input', async () => {
    //Given no input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '';
    //when
    const result = optionalIntegerValidator.validate(validNumericInput, new DummyClass());
    //then
    expect(result).toBeTruthy();
  });
});

