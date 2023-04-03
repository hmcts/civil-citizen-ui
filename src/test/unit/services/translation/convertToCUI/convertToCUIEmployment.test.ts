import {toCUIEmployment} from 'services/translation/convertToCUI/convertToCUIEmployment';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDEmploymentOption} from 'models/ccdResponse/ccdEmploymentOption';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';

describe('translate Employment to CUI model', () => {
  it('should return undefined if Employment doesnt exist', () => {
    //Given
    //When
    const output = toCUIEmployment(undefined, undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Employment exist', () => {
    //Given
    const input = [
      CCDEmploymentOption.SELF,
      CCDEmploymentOption.EMPLOYED,
    ];
    //When
    const output = toCUIEmployment(YesNoUpperCamelCase.YES, input);
    //Then
    const expected = {
      declared: true,
      employmentType: [
        EmploymentCategory.SELF_EMPLOYED,
        EmploymentCategory.EMPLOYED,
      ],
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Employment exist with No', () => {
    //Given
    //When
    const output = toCUIEmployment(YesNoUpperCamelCase.NO, undefined);
    //Then
    const expected = {
      declared: false,
    };
    expect(output).toEqual(expected);
  });
});
