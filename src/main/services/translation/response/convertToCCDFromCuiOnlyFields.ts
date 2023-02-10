import {CCDResponseCuiFields} from "models/ccdResponse/ccdResponseCuiFields";
import {Claim} from "models/claim";
import {YesNoUpperCamelCase} from "form/models/yesNo";

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    partnerPensionCui: claim.statementOfMeans?.partnerPension?.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerDisabilityCui: claim.statementOfMeans?.partnerDisability.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerSevereDisabilityCui: claim.statementOfMeans?.partnerSevereDisability?.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    childrenEducationCui: claim.statementOfMeans?.numberOfChildrenLivingWithYou.toString()
  }
}
