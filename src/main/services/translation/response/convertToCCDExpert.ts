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
    expertRequired: toCCDResponse(claim),
    details: toCCDExpertDetails(claim.directionQuestionnaire?.experts?.expertDetailsList?.items),
    expertReportsSent: toCCDExpertReport(claim.directionQuestionnaire?.experts?.sentExpertReports?.option),
    jointExpertSuitable: toCCDYesNoFromGenericYesNo(claim.directionQuestionnaire?.experts?.sharedExpert),
  };
};

function toCCDResponse(claim: Claim) {
  if(claim.isFastTrackClaim)
    return toCCDYesNo(claim.directionQuestionnaire?.experts?.expertEvidence?.option);
  else
    return toCCDYesNoFromBoolean(claim.directionQuestionnaire?.experts?.expertRequired);

}

function toCCDExpertReport(sentExpertReports: YesNoNotReceived | undefined) {
  switch (sentExpertReports) {
    case 'yes' : return CCDExportReportSent.YES;
    case 'no'  : return CCDExportReportSent.NO;
    case 'not-received' : return CCDExportReportSent.NOT_OBTAINED;
    default: return undefined;
  }
}

function toCCDExpertDetails(expertDetailsList: ExpertDetails[]) {
  if (!expertDetailsList?.length) return undefined;
  const expertList = expertDetailsList.map((expertDetails: ExpertDetails) => {
    return {
      value: {
        name : expertDetails.firstName+ ' ' +expertDetails.lastName,
        firstName: expertDetails.firstName,
        lastName: expertDetails.lastName,
        phoneNumber: expertDetails.phoneNumber.toString(),
        emailAddress: expertDetails.emailAddress,
        whyRequired: expertDetails.whyNeedExpert,
        fieldOfExpertise: expertDetails.fieldOfExpertise,
        estimatedCost: expertDetails.estimatedCost*100,
      },
    };
  });
  return expertList;
}

