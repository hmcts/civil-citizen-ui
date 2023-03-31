import {
  toCCDYesNo,
  toCCDYesNoFromBoolean,
  toCCDYesNoFromGenericYesNo,
} from 'services/translation/response/convertToCCDYesNo';
import {CCDExportReportSent} from 'models/ccdResponse/ccdExpert';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {Claim} from 'models/claim';
import {YesNoNotReceived} from 'form/models/yesNo';

export const toCCDExpert = (claim: Claim) => {
  return{
    expertRequired: toCCDExpertRequiredResponse(claim),
    details: toCCDExpertDetails(claim.directionQuestionnaire?.experts?.expertDetailsList?.items),
    expertReportsSent: toCCDExpertReport(claim.directionQuestionnaire?.experts?.sentExpertReports?.option),
    jointExpertSuitable: toCCDYesNoFromGenericYesNo(claim.directionQuestionnaire?.experts?.sharedExpert),
  };
};

const toCCDExpertRequiredResponse = (claim: Claim) => {
  if (claim.isFastTrackClaim) {
    return toCCDYesNo(claim.directionQuestionnaire?.experts?.expertEvidence?.option);
  } else {
    return toCCDYesNoFromBoolean(claim.directionQuestionnaire?.experts?.expertRequired);
  }
};

const toCCDExpertReport = (sentExpertReports: YesNoNotReceived | undefined) => {
  const mapping = {
    'yes': CCDExportReportSent.YES,
    'no': CCDExportReportSent.NO,
    'not-received': CCDExportReportSent.NOT_OBTAINED,
  };
  return sentExpertReports ? mapping[sentExpertReports] : undefined;
};

const toCCDExpertDetails = (expertDetailsList: ExpertDetails[]) => {
  const expertList = expertDetailsList?.map((expertDetails: ExpertDetails) => {
    return {
      value: {
        name: expertDetails.firstName+ ' ' + expertDetails.lastName,
        firstName: expertDetails.firstName,
        lastName: expertDetails.lastName,
        phoneNumber: expertDetails.phoneNumber.toString(),
        emailAddress: expertDetails.emailAddress,
        whyRequired: expertDetails.whyNeedExpert,
        fieldOfExpertise: expertDetails.fieldOfExpertise,
        estimatedCost: expertDetails.estimatedCost * 100,
      },
    };
  });
  return expertList ?? undefined;
};

