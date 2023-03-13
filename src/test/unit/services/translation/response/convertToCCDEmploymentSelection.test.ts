import {toCCDEmploymentSelection} from 'services/translation/response/convertToCCDEmploymentSelection';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';

describe('translate employment selection to CCD model', () => {
  it('should return values if there is input', () => {
    //Given
    const input : EmploymentCategory[] = [
      EmploymentCategory.SELF_EMPLOYED,
      EmploymentCategory.EMPLOYED,
    ];
    const expected: string[] = [
      'SELF', 'EMPLOYED',
    ];
    //When
    const output = toCCDEmploymentSelection(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if input is undefined', () => {
    //Given
    const input : EmploymentCategory[] = [
      undefined,
    ];
    const expected: string[] = [
      undefined,
    ];
    //When
    const output = toCCDEmploymentSelection(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if it is undefined', () => {
    //Given
    //When
    const output = toCCDEmploymentSelection(undefined);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return values if there is empty', () => {
    //Given
    const input : EmploymentCategory[] = [];
    //When
    const output = toCCDEmploymentSelection(input);
    //Then
    expect(output).toEqual(undefined);
  });
});
