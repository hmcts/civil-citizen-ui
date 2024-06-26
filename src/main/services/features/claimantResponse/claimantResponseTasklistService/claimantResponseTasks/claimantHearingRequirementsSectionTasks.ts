import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Task} from 'models/taskList/task';
import {DETERMINATION_WITHOUT_HEARING_URL, DQ_TRIED_TO_SETTLE_CLAIM_URL} from 'routes/urls';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {isIntermediateTrack, isMultiTrack} from 'form/models/claimType';

export function getGiveUsDetailsClaimantHearingTask(claim: Claim, claimId: string, lang: string, mintiApplicable: boolean): Task {
  const claimantDQ = Object.assign(new DirectionQuestionnaire(), claim.claimantResponse?.directionQuestionnaire);
  const linkUrl = claim.isSmallClaimsTrackDQ ? DETERMINATION_WITHOUT_HEARING_URL : DQ_TRIED_TO_SETTLE_CLAIM_URL;
  const isTaskCompleted = checkTaskCompleteForTrack(claim, claimantDQ, mintiApplicable);
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, linkUrl),
    status: isTaskCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
}

const checkTaskCompleteForTrack = (claim: Claim, claimantDQ: DirectionQuestionnaire, mintiApplicable: boolean): boolean => {
  if (claim.isSmallClaimsTrackDQ) {
    return claimantDQ.isSmallClaimsDQJourneyCompleted;
  } else if (claim.isFastTrackClaim) {
    return claimantDQ.isFastTrackDQJourneyCompleted;
  } else if (isIntermediateTrack(claim.totalClaimAmount, mintiApplicable) || isMultiTrack(claim.totalClaimAmount, mintiApplicable)) {
    return claimantDQ.isIntermediateOrMultiTrackDQJourneyCompleted;
  }
  return false;
};
