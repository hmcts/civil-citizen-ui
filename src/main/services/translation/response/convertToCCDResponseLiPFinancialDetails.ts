import {StatementOfMeans} from 'models/statementOfMeans';
import {
  CCDFinancialDetailsLiP,
} from 'models/ccdResponse/ccdFinancialDetailsLiP';
import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDResponseLiPFinancialDetails = (statementOfMeans: StatementOfMeans): CCDFinancialDetailsLiP => {
  return {
    partnerPensionLiP: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerPension),
    partnerDisabilityLiP: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerDisability),
    partnerSevereDisabilityLiP: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerSevereDisability),
    childrenEducationLiP: statementOfMeans?.numberOfChildrenLivingWithYou?.toString(),
  };
};
