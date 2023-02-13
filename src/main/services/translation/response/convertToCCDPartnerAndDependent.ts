import {StatementOfMeans} from "models/statementOfMeans";
import {CCDChildrenByAgeGroup, CCDPartnerAndDependent} from "models/ccdResponse/ccdPartnerAndDependent";
import {YesNo, YesNoUpperCamelCase} from "form/models/yesNo";
import {Dependants} from "form/models/statementOfMeans/dependants/dependants";

export const toCCDPartnerAndDependents = (statementOfMeans: StatementOfMeans): CCDPartnerAndDependent => {
  return {
    liveWithPartnerRequired: (statementOfMeans?.cohabiting === YesNo.YES) ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    partnerAgedOver: (statementOfMeans?.partnerAge === YesNo.YES) ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    haveAnyChildrenRequired: (statementOfMeans?.dependants?.declared) ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    howManyChildrenByAgeGroup: toCCDChildrenByAgeGroup(statementOfMeans?.dependants),
    receiveDisabilityPayments: (statementOfMeans?.childrenDisability?.option === YesNo.YES) ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    supportedAnyoneFinancialRequired: (statementOfMeans?.otherDependants?.option === YesNo.YES) ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    supportPeopleNumber: statementOfMeans?.otherDependants?.numberOfPeople?.toString(),
    supportPeopleDetails: statementOfMeans?.otherDependants?.details,
  }
}

const toCCDChildrenByAgeGroup = (dependents: Dependants) : CCDChildrenByAgeGroup => {
  return {
    numberOfUnderEleven: dependents?.numberOfChildren?.under11.toString(),
    numberOfElevenToFifteen: dependents?.numberOfChildren?.between11and15.toString(),
    numberOfSixteenToNineteen: dependents?.numberOfChildren?.between16and19.toString(),
  };
}
