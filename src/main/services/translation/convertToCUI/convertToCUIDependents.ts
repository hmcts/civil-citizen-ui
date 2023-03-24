import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {CCDChildrenByAgeGroup, CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {toCUIBoolean} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIDependents = (partnerAndDependents: CCDPartnerAndDependent): Dependants => {
  if (!partnerAndDependents) return undefined;
  return new Dependants(
    toCUIBoolean(partnerAndDependents.haveAnyChildrenRequired),
    toCUINumberOfChildren(partnerAndDependents.howManyChildrenByAgeGroup),
  );
};

const toCUINumberOfChildren = (childrenByAgeGroup : CCDChildrenByAgeGroup): NumberOfChildren => {
  if (!childrenByAgeGroup) return undefined;
  return new NumberOfChildren(
    Number(childrenByAgeGroup.numberOfUnderEleven),
    Number(childrenByAgeGroup.numberOfElevenToFifteen),
    Number(childrenByAgeGroup.numberOfSixteenToNineteen),
  );
};
