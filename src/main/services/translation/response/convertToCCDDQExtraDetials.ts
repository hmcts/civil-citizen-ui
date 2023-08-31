import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from 'form/models/yesNo';
import {toCCDLiPExpert} from 'services/translation/response/convertToCCDLiPExpert';

export const toCCDDQExtraDetails = (directionQuestionnaire: DirectionQuestionnaire | undefined) => {
  return {
    wantPhoneOrVideoHearing: toCCDYesNo(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option),
    whyPhoneOrVideoHearing: directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES ? directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details : '',
    whyUnavailableForHearing: directionQuestionnaire?.hearing?.whyUnavailableForHearing?.reason,
    giveEvidenceYourSelf: toCCDYesNo(directionQuestionnaire?.defendantYourselfEvidence?.option),
    triedToSettle: toCCDYesNo(directionQuestionnaire?.hearing?.triedToSettle?.option),
    determinationWithoutHearingRequired: toCCDYesNo(directionQuestionnaire?.hearing?.determinationWithoutHearing?.option),
    determinationWithoutHearingReason: directionQuestionnaire?.hearing?.determinationWithoutHearing?.option === YesNo.NO ? directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing : '',
    requestExtra4weeks: toCCDYesNo(directionQuestionnaire?.hearing?.requestExtra4weeks?.option),
    considerClaimantDocuments: toCCDYesNo(directionQuestionnaire?.hearing?.considerClaimantDocuments?.option),
    considerClaimantDocumentsDetails: directionQuestionnaire?.hearing?.considerClaimantDocuments?.option == YesNo.YES ? directionQuestionnaire?.hearing?.considerClaimantDocuments?.details : '',
    respondent1DQLiPExpert: toCCDLiPExpert(directionQuestionnaire?.experts),
    // TODO : include this field to existing field civil service and ccd-def
    claimant1DQLiPExpert: toCCDLiPExpert(directionQuestionnaire?.experts),
  };
};
