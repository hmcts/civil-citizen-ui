import {
  toCCDYesNo,
  toCCDYesNoFromGenericYesNo,
} from 'services/translation/response/convertToCCDYesNo';
import {CCDExportReportSent} from 'models/ccdResponse/ccdExpert';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {Claim} from 'models/claim';
import {YesNoNotReceived, YesNoUpperCamelCase} from 'form/models/yesNo';

export const toCCDExpert = (claim: Claim) => {
  const referenceDQ = claim.isClaimantIntentionPending() ? claim.claimantResponse?.directionQuestionnaire : claim.directionQuestionnaire;
  return{
    expertRequired: toCCDExpertRequiredResponse(claim),
    details: toCCDExpertRequiredResponse(claim) === YesNoUpperCamelCase.YES ? toCCDExpertDetails(referenceDQ?.experts?.expertDetailsList?.items) : undefined,
    expertReportsSent: toCCDExpertReport(referenceDQ?.experts?.sentExpertReports?.option),
    jointExpertSuitable: toCCDYesNoFromGenericYesNo(referenceDQ?.experts?.sharedExpert),
  };
};

const toCCDExpertRequiredResponse = (claim: Claim) => {
  const referenceDQ = claim.isClaimantIntentionPending() ? claim.claimantResponse?.directionQuestionnaire : claim.directionQuestionnaire;
  if (claim.isFastTrackClaim) {
    return toCCDYesNo(referenceDQ?.experts?.expertEvidence?.option);
  } else {
    return toCCDYesNo(referenceDQ?.experts?.expertCanStillExamine?.option);
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
        phoneNumber: expertDetails.phoneNumber?.toString(),
        emailAddress: expertDetails.emailAddress,
        whyRequired: expertDetails.whyNeedExpert,
        fieldOfExpertise: expertDetails.fieldOfExpertise,
        estimatedCost: expertDetails.estimatedCost * 100,
      },
    };
  });
  return expertList ?? undefined;
};

