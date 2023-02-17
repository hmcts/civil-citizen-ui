import {toCCDFieldsOnlyInCuiFinancialDetails} from "services/translation/response/convertToCCDFromCuiOnlyFinancialDetails";
import {CCDFinancialDetailsCuiFields} from "models/ccdResponse/ccdFinancialDetailsCuiFields";
import {StatementOfMeans} from "models/statementOfMeans";
import {GenericYesNo} from "form/models/genericYesNo";
import {YesNo, YesNoUpperCamelCase} from "form/models/yesNo";

describe('translate cui fields to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const expected : CCDFinancialDetailsCuiFields = {
      partnerPensionCui: undefined,
      partnerDisabilityCui: undefined,
      partnerSevereDisabilityCui: undefined,
      childrenEducationCui: undefined,
    }
    const output = toCCDFieldsOnlyInCuiFinancialDetails(undefined);
    expect(output).toEqual(expected);
  });

  it('should return value if the input', () => {
    const input = new StatementOfMeans();
    input.partnerPension = new GenericYesNo(YesNo.YES);
    input.partnerDisability = new GenericYesNo(YesNo.YES);
    input.partnerSevereDisability = new GenericYesNo(YesNo.YES);
    input.numberOfChildrenLivingWithYou = Number(1);
    const expected : CCDFinancialDetailsCuiFields = {
      partnerPensionCui: YesNoUpperCamelCase.YES,
      partnerDisabilityCui: YesNoUpperCamelCase.YES,
      partnerSevereDisabilityCui: YesNoUpperCamelCase.YES,
      childrenEducationCui: '1',
    }
    const output = toCCDFieldsOnlyInCuiFinancialDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return undefined if input is undefined', () => {
    const input = new StatementOfMeans();
    input.partnerPension = undefined;
    input.partnerDisability = undefined;
    input.partnerSevereDisability = undefined;
    input.numberOfChildrenLivingWithYou = undefined;
    const expected : CCDFinancialDetailsCuiFields = {
      partnerPensionCui: undefined,
      partnerDisabilityCui: undefined,
      partnerSevereDisabilityCui: undefined,
      childrenEducationCui: undefined,
    }
    const output = toCCDFieldsOnlyInCuiFinancialDetails(input);
    expect(output).toEqual(expected);
  });
});
