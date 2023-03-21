import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIOtherDependents = (partnerAndDependents: CCDPartnerAndDependent): OtherDependants => {
  if (!partnerAndDependents) return undefined;

  return new OtherDependants(
    toCUIYesNo(partnerAndDependents?.supportedAnyoneFinancialRequired),
    Number(partnerAndDependents?.supportPeopleNumber),
    partnerAndDependents?.supportPeopleDetails,
  );
};
