import {CCDRespondentLiPResponse} from 'models/ccdResponse/CCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {toUpperYesOrNo} from 'services/translation/response/convertToCCDRespondentDQ';
// import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    // TODO Not related to CIV-5788
    // responseDeadlineMoreTimeRequest: claim.responseDeadline?.option,
    // responseDeadlineAdditionalTime: claim.responseDeadline?.additionalTime,
    // responseDeadlineAgreedResponseDeadline: claim.responseDeadline?.agreedResponseDeadline,
    // mediationContactPerson: claim.mediation?.companyTelephoneNumber?.mediationContactPerson,
    // mediationContactPhone: claim.mediation?.companyTelephoneNumber?.mediationPhoneNumber,
    // determinationWithoutHearing: claim.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option,
    // determinationReasonForHearing: claim.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing,
    // defendantYourSelfEvidence: toUpperYesOrNo(claim.directionQuestionnaire?.defendantYourselfEvidence),
    // expertReportsAvailable: claim.directionQuestionnaire?.expertReportDetailsAvailable ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    // expertReports: claim.directionQuestionnaire?.experts?.expertReportDetails?.reportDetails,
    // permissionToUseAnExpert: claim.directionQuestionnaire?.experts?.permissionForExpert?.option,
    // expertCanStillExamine: claim.directionQuestionnaire?.experts?.expertCanStillExamine,
    // TODO Is it duplicate with specDefenceAdmittedRequired
    partialAdmissionAlreadyPaid: toUpperYesOrNo(claim.partialAdmission?.alreadyPaid),
    timelineComment: claim.partialAdmission?.timeline?.comment,
    // TODO Adding evidence translation
    evidenceComment: claim.evidence?.comment,
  };
};
