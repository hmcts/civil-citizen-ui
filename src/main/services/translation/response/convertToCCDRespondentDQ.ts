import {CCDExpert, CcdExpertReportSent, CCDRespondentDQ, CCDWitness} from 'models/ccdResponse/ccdExpertReportSent';
import {Claim} from 'models/claim';
import {YesNo, YesNoNotReceived, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

export const toCCDRespondentDQ = (claim: Claim): CCDRespondentDQ => {
  return {
    respondent1DQExperts: {
      expertRequired: claim.directionQuestionnaire?.experts?.expertRequired ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
      expertReportsSent: getExpertReportsSent(claim),
      jointExpertSuitable: toUpperYesOrNo(claim.directionQuestionnaire?.experts?.sharedExpert),
      details: getExpertDetails(claim),
    },
    respondent1DQWitnesses: {
      witnessesToAppear: toUpperYesNo(claim.directionQuestionnaire?.witnesses?.otherWitnesses?.option),
      details: getWitnessDetails(claim),
    },
  };
};

const toUpperYesNo = (yesNo: YesNo): YesNoUpperCamelCase => {
  return yesNo?.toLowerCase() === 'yes' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};

export const toUpperYesOrNo = (yesNo: GenericYesNo): YesNoUpperCamelCase => {
  return yesNo?.option.toLowerCase() ===  'yes' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};
const getExpertReportsSent = (claim: Claim): CcdExpertReportSent => {
  switch(claim.directionQuestionnaire?.experts?.sentExpertReports){
    case YesNoNotReceived.YES:
      return CcdExpertReportSent.YES;
    case YesNoNotReceived.NO:
      return CcdExpertReportSent.NO;
    case YesNoNotReceived.NOT_RECEIVED:
      return CcdExpertReportSent.NOT_OBTAINED;
  }
};

const getWitnessDetails = (claim: Claim): CCDWitness [] => {
  const details: CCDWitness[] = [];

  claim.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems.forEach(e => {
    const ccdWitness: CCDWitness = new CCDWitness();
    ccdWitness.firstName = e.firstName;
    ccdWitness.lastName = e.lastName;
    ccdWitness.emailAddress = e.email;
    ccdWitness.phoneNumber = e.telephone;
    ccdWitness.reasonForWitness = e.details;

    details.push(ccdWitness);
  });

  return details;
};
const getExpertDetails = (claim: Claim): CCDExpert [] => {
  const details: CCDExpert[] = [];

  claim.directionQuestionnaire?.experts?.expertDetailsList?.items.forEach(e => {
    const ccdExpert: CCDExpert = new CCDExpert();
    ccdExpert.firstName = e.firstName;
    ccdExpert.lastName = e.lastName;
    ccdExpert.emailAddress = e.emailAddress;
    ccdExpert.fieldOfExpertise = e.fieldOfExpertise;
    ccdExpert.estimatedCost = e.estimatedCost;
    ccdExpert.whyRequired = e.whyNeedExpert;

    details.push(ccdExpert);
  });

  return details;
};
