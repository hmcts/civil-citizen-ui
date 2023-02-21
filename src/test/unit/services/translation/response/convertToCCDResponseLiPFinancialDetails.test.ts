import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {toCCDResponseLiPFinancialDetails} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';

describe('translate cui fields to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    const expected : CCDFinancialDetailsLiP = {
      partnerPensionLiP: undefined,
      partnerDisabilityLiP: undefined,
      partnerSevereDisabilityLiP: undefined,
      childrenEducationLiP: undefined,
    };
    //When
    const output = toCCDResponseLiPFinancialDetails(undefined);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if the input', () => {
    //Given
    const input = new StatementOfMeans();
    input.partnerPension = new GenericYesNo(YesNo.YES);
    input.partnerDisability = new GenericYesNo(YesNo.YES);
    input.partnerSevereDisability = new GenericYesNo(YesNo.YES);
    input.numberOfChildrenLivingWithYou = Number(1);
    const expected : CCDFinancialDetailsLiP = {
      partnerPensionLiP: YesNoUpperCamelCase.YES,
      partnerDisabilityLiP: YesNoUpperCamelCase.YES,
      partnerSevereDisabilityLiP: YesNoUpperCamelCase.YES,
      childrenEducationLiP: '1',
    };
    //When
    const output = toCCDResponseLiPFinancialDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if input is undefined', () => {
    //Given
    const input = new StatementOfMeans();
    input.partnerPension = undefined;
    input.partnerDisability = undefined;
    input.partnerSevereDisability = undefined;
    input.numberOfChildrenLivingWithYou = undefined;
    const expected : CCDFinancialDetailsLiP = {
      partnerPensionLiP: undefined,
      partnerDisabilityLiP: undefined,
      partnerSevereDisabilityLiP: undefined,
      childrenEducationLiP: undefined,
    };
    //When
    const output = toCCDResponseLiPFinancialDetails(input);
    //Then
    expect(output).toEqual(expected);
  });
});
