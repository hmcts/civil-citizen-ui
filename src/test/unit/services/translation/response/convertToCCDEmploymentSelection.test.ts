import {toCCDEmploymentSelection} from "services/translation/response/convertToCCDEmploymentSelection";
import {EmploymentCategory} from "form/models/statementOfMeans/employment/employmentCategory";

describe('translate employment selection to CCD model', () => {
  it('should return values if there is input', () => {

    const input : EmploymentCategory[] = [
      EmploymentCategory.SELF_EMPLOYED,
      EmploymentCategory.EMPLOYED
    ];
    const expected: string[] = [
      'SELF', 'EMPLOYED'
    ]

    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(expected);
  });

  it('should return values if input is undefined', () => {
    const input : EmploymentCategory[] = [
      undefined
    ];
    const expected: string[] = [
      undefined
    ]

    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(expected);
  });

  it('should return values if it is undefined', () => {
    const output = toCCDEmploymentSelection(undefined);
    expect(output).toEqual(undefined);
  });

  it('should return values if there is empty', () => {
    const input : EmploymentCategory[] = [];

    const output = toCCDEmploymentSelection(input);
    expect(output).toEqual(undefined);
  });
});
