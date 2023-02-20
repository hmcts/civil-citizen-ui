import {StatementOfMeans} from 'models/statementOfMeans';
import {CCDChildrenByAgeGroup, CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {toCCDYesNoFromBoolean, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDPartnerAndDependents = (statementOfMeans: StatementOfMeans): CCDPartnerAndDependent => {
  return {
    liveWithPartnerRequired: toCCDYesNoFromGenericYesNo(statementOfMeans?.cohabiting),
    partnerAgedOver: toCCDYesNoFromGenericYesNo(statementOfMeans?.partnerAge),
    haveAnyChildrenRequired: toCCDYesNoFromBoolean(statementOfMeans?.dependants?.declared),
    howManyChildrenByAgeGroup: toCCDChildrenByAgeGroup(statementOfMeans?.dependants),
    receiveDisabilityPayments: toCCDYesNoFromGenericYesNo(statementOfMeans?.childrenDisability),
    supportedAnyoneFinancialRequired: toCCDYesNoFromGenericYesNo(statementOfMeans?.otherDependants),
    supportPeopleNumber: statementOfMeans?.otherDependants?.numberOfPeople?.toString(),
    supportPeopleDetails: statementOfMeans?.otherDependants?.details,
  };
};

const toCCDChildrenByAgeGroup = (dependents: Dependants) : CCDChildrenByAgeGroup => {
  return {
    numberOfUnderEleven: dependents?.numberOfChildren?.under11?.toString(),
    numberOfElevenToFifteen: dependents?.numberOfChildren?.between11and15?.toString(),
    numberOfSixteenToNineteen: dependents?.numberOfChildren?.between16and19?.toString(),
  };
};
