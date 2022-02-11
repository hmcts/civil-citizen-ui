import {OptionalIntegerValidator} from '../../../../../main/common/form/validators/optionalIntegerValidator';
import {ValidationArguments} from 'class-validator';



describe('OptionalIntegerValidator', () => {
  const mock = jest.fn<ValidationArguments, []>(() => {
    const person = {
      firstName: 'Tom',
      lastName: 'Hanks',
    };
    return {
      constraints : ['strict', 'lenient', 'none'],
      object: person,
      property: 'property',
      targetName: 'targetName',
      value: '',
    };
  });

  it('should return true for numeric input', async () => {
    //Given a valid input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '1232134234';
    //When input is validated
    const result = optionalIntegerValidator.validate(validNumericInput, new mock());
    //Then
    expect(result).toBeTruthy();
  });

  it('should return false for input with special characters', async () => {
    //Given input with special characters
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '+442342845452';
    //When
    const result = optionalIntegerValidator.validate(validNumericInput, new mock());
    //Then
    expect(result).toBeFalsy();
  });

  it('should return false for input with alphanumeric characters', async () => {
    //Given alphanumeric input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = 'sdfswsdfsdf';
    //When
    const result = optionalIntegerValidator.validate(validNumericInput, new mock());
    //Then
    expect(result).toBeFalsy();
  });

  it('should return true for null or empty input', async () => {
    //Given no input
    const optionalIntegerValidator = new OptionalIntegerValidator();
    const validNumericInput  = '';
    //when
    const result = optionalIntegerValidator.validate(validNumericInput, new mock());
    //then
    expect(result).toBeTruthy();
  });
});

