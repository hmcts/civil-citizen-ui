import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    partnerPensionCui: claim.statementOfMeans?.partnerPension?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerDisabilityCui: claim.statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerSevereDisabilityCui: claim.statementOfMeans?.partnerSevereDisability?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    childrenEducationCui: claim.statementOfMeans?.numberOfChildrenLivingWithYou?.toString(),

  };
};
