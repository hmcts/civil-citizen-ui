import {toCUICarerAllowanceCredit} from 'services/translation/convertToCUI/convertToCUICareerAllowance';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

describe('translate Career Allowance to CUI model', () => {
  it('should return undefined if Career Allowance doesnt exist', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Career Allowance exists with Yes', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(YesNoUpperCamelCase.YES);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.YES));
  });

  it('should return data if Career Allowance exists with No', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(YesNoUpperCamelCase.NO);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.NO));
  });
});
