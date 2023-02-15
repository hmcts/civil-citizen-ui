import {toCCDEmploymentSelection} from "services/translation/response/convertToCCDEmploymentSelection";
import {EmploymentCategory} from "form/models/statementOfMeans/employment/employmentCategory";

describe('translate employment selection to CCD model', () => {
  it('should return values if there is input', () => {
    //input
    const input : EmploymentCategory[] = [
      EmploymentCategory.SELF_EMPLOYED,
      EmploymentCategory.EMPLOYED
    ];
    const expected: string[] = [
      'SELF', 'EMPLOYED'
    ]
    //output
    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(expected);
  });

  it('should return values if input is undefined', () => {
    //input
    const input : EmploymentCategory[] = [
      undefined
    ];
    const expected: string[] = [
      undefined
    ]
    //output
    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(expected);
  });

  it('should return values if it is undefined', () => {
    //input
    const output = toCCDEmploymentSelection(undefined);
    //output
    expect(output).toEqual(undefined);
  });

  it('should return values if there is empty', () => {
    //input
    const input : EmploymentCategory[] = [];
    //output
    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(undefined);
  });
});
