import {CCDResponseLipFields} from 'models/ccdResponse/CCDResponseLipFields';
import {Claim} from 'models/claim';
import {toUpperYesOrNo} from 'services/translation/response/convertToCCDRespondentDQ';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const toCCDFieldsOnlyInLip = (claim: Claim): CCDResponseLipFields => {
  return {
    responseDeadlineMoreTimeRequest: claim.responseDeadline?.option,
    responseDeadlineAdditionalTime: claim.responseDeadline?.additionalTime,
    responseDeadlineAgreedResponseDeadline: claim.responseDeadline?.agreedResponseDeadline,
    partialAdmissionAlreadyPaid: toUpperYesOrNo(claim.partialAdmission?.alreadyPaid),
    timelineComment: claim.partialAdmission?.timeline?.comment,
    evidenceComment: claim.evidence?.comment,
    mediationContactPerson: claim.mediation?.companyTelephoneNumber?.mediationContactPerson,
    mediationContactPhone: claim.mediation?.companyTelephoneNumber?.mediationPhoneNumber,
    determinationWithoutHearing: claim.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option,
    determinationReasonForHearing: claim.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing,
    defendantYourSelfEvidence: toUpperYesOrNo(claim.directionQuestionnaire?.defendantYourselfEvidence),
    expertReportsAvailable: claim.directionQuestionnaire?.expertReportDetailsAvailable ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    expertReports: claim.directionQuestionnaire?.experts?.expertReportDetails?.reportDetails,
    permissionToUseAnExpert: claim.directionQuestionnaire?.experts?.permissionForExpert?.option,
    expertCanStillExamine: claim.directionQuestionnaire?.experts?.expertCanStillExamine,
  };
};
