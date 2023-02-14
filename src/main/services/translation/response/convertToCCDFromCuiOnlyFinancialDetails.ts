import {StatementOfMeans} from "models/statementOfMeans";
import {CCDFinancialDetailsCuiFields} from "models/ccdResponse/ccdFinancialDetailsCuiFields";
import {toCCDYesNoFromGenericYesNo} from "services/translation/response/convertToCCDYesNo";

export const toCCDFieldsOnlyInCuiFinancialDetails = (statementOfMeans: StatementOfMeans): CCDFinancialDetailsCuiFields => {
  return {
    partnerPensionCui: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerPension),
    partnerDisabilityCui: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerDisability),
    partnerSevereDisabilityCui: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerSevereDisability),
    childrenEducationCui: statementOfMeans?.numberOfChildrenLivingWithYou?.toString()
  }
}
