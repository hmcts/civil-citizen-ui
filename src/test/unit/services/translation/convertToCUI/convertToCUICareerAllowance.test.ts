import {toCUICarerAllowanceCredit} from 'services/translation/convertToCUI/convertToCUICareerAllowance';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

describe('translate Career Allowance to CUI model', () => {
  it('should return undefined if Career Allowance doesnt exist', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(undefined, undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Career Allowance Part Admit exists with Yes', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(YesNoUpperCamelCase.YES, undefined);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.YES));
  });

  it('should return data if Career Allowance Part Admit exists with No', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(YesNoUpperCamelCase.NO, undefined);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.NO));
  });

  it('should return data if Career Allowance Full Admit exists with Yes', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(undefined, YesNoUpperCamelCase.YES);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.YES));
  });

  it('should return data if Career Allowance Part Admit exists with No', () => {
    //Given
    //When
    const output = toCUICarerAllowanceCredit(undefined, YesNoUpperCamelCase.NO);
    //Then
    expect(output).toEqual(new GenericYesNo(YesNo.NO));
  });
});
