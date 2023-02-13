import {StatementOfMeans} from "models/statementOfMeans";
import {YesNo, YesNoUpperCamelCase} from "form/models/yesNo";
import {CCDFinancialDetailsCuiFields} from "models/ccdResponse/ccdFinancialDetailsCuiFields";

export const toCCDFieldsOnlyInCuiFinancialDetails = (statementOfMeans: StatementOfMeans): CCDFinancialDetailsCuiFields => {
  return {
    partnerPensionCui: statementOfMeans?.partnerPension?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerDisabilityCui: statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerSevereDisabilityCui: statementOfMeans?.partnerSevereDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    childrenEducationCui: statementOfMeans?.numberOfChildrenLivingWithYou?.toString()
  }
}
