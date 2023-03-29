import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from 'form/models/yesNo';

export const toCCDDQExtraDetails = (directionQuestionnaire: DirectionQuestionnaire | undefined) => {
  return {
    wantPhoneOrVideoHearing: toCCDYesNo(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option),
    whyPhoneOrVideoHearing: directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES ? directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details : '',
    whyUnavailableForHearing: directionQuestionnaire?.hearing?.whyUnavailableForHearing?.reason,
    giveEvidenceYourSelf: toCCDYesNo(directionQuestionnaire?.defendantYourselfEvidence?.option),
  };
};
