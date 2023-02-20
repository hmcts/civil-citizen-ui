import {toCCDFieldsOnlyInLiPFinancialDetails} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';
import {CcdFinancialDetailsLiP} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate cui fields to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const expected : CcdFinancialDetailsLiP = {
      partnerPensionLiP: undefined,
      partnerDisabilityLiP: undefined,
      partnerSevereDisabilityLiP: undefined,
      childrenEducationLiP: undefined,
    };
    const output = toCCDFieldsOnlyInLiPFinancialDetails(undefined);
    expect(output).toEqual(expected);
  });

  it('should return value if the input', () => {
    const input = new StatementOfMeans();
    input.partnerPension = new GenericYesNo(YesNo.YES);
    input.partnerDisability = new GenericYesNo(YesNo.YES);
    input.partnerSevereDisability = new GenericYesNo(YesNo.YES);
    input.numberOfChildrenLivingWithYou = Number(1);
    const expected : CcdFinancialDetailsLiP = {
      partnerPensionLiP: YesNoUpperCamelCase.YES,
      partnerDisabilityLiP: YesNoUpperCamelCase.YES,
      partnerSevereDisabilityLiP: YesNoUpperCamelCase.YES,
      childrenEducationLiP: '1',
    };
    const output = toCCDFieldsOnlyInLiPFinancialDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return undefined if input is undefined', () => {
    const input = new StatementOfMeans();
    input.partnerPension = undefined;
    input.partnerDisability = undefined;
    input.partnerSevereDisability = undefined;
    input.numberOfChildrenLivingWithYou = undefined;
    const expected : CcdFinancialDetailsLiP = {
      partnerPensionLiP: undefined,
      partnerDisabilityLiP: undefined,
      partnerSevereDisabilityLiP: undefined,
      childrenEducationLiP: undefined,
    };
    const output = toCCDFieldsOnlyInLiPFinancialDetails(input);
    expect(output).toEqual(expected);
  });
});
