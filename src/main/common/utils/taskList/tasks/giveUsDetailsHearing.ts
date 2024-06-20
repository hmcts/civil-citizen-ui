import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Task} from 'common/models/taskList/task';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {getLng} from 'common/utils/languageToggleUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {isIntermediateTrack, isMultiTrack} from 'form/models/claimType';

const checkTaskCompleteForTrack = (claim: Claim, defendantDQ: DirectionQuestionnaire, mintiApplicable: boolean): boolean => {
  if (claim.isSmallClaimsTrackDQ) {
    return defendantDQ.isSmallClaimsDQJourneyCompleted;
  } else if (claim.isFastTrackClaim) {
    return defendantDQ.isFastTrackDQJourneyCompleted;
  } else if (isIntermediateTrack(claim.totalClaimAmount, mintiApplicable) || isMultiTrack(claim.totalClaimAmount, mintiApplicable)) {
    return defendantDQ.isIntermediateOrMultiTrackDQJourneyCompleted;
  }
  return false;
};

export const getGiveUsDetailsHearingTask = (claim: Claim, claimId: string, lang: string, mintiApplicable: boolean): Task => {
  const defendantDQ = Object.assign(new DirectionQuestionnaire(), claim.directionQuestionnaire);
  const linkUrl = !claim.isSmallClaimsTrackDQ ? DQ_TRIED_TO_SETTLE_CLAIM_URL : DETERMINATION_WITHOUT_HEARING_URL;
  const isTaskCompleted = checkTaskCompleteForTrack(claim, defendantDQ, mintiApplicable);
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, linkUrl),
    status: isTaskCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};
