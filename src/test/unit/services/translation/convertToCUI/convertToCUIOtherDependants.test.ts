import {toCUIOtherDependents} from 'services/translation/convertToCUI/convertToCUIOtherDependents';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';

describe('translate Other Dependents to CUI model', () => {
  it('should return undefined if Other Dependents doesnt exist', () => {
    //Given
    //When
    const output = toCUIOtherDependents(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Other Dependents exist', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      supportedAnyoneFinancialRequired: YesNoUpperCamelCase.YES,
      supportPeopleNumber: ('1'),
      supportPeopleDetails: 'test',
    };
    //When
    const output = toCUIOtherDependents(input);
    //Then
    const expected = new OtherDependants(YesNo.YES, 1, 'test');
    expect(output).toEqual(expected);
  });

  it('should return undefined if Other Dependents undefined', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      supportedAnyoneFinancialRequired: undefined,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //When
    const output = toCUIOtherDependents(input);
    //Then
    const expected = new OtherDependants(undefined, undefined, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if Other Dependents exist with No', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      supportedAnyoneFinancialRequired: YesNoUpperCamelCase.NO,
      supportPeopleNumber: undefined,
      supportPeopleDetails: undefined,
    };
    //When
    const output = toCUIOtherDependents(input);
    //Then
    const expected = new OtherDependants(YesNo.NO, undefined, undefined);
    expect(output).toEqual(expected);
  });
});
