import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Task} from 'models/taskList/task';
import {DETERMINATION_WITHOUT_HEARING_URL, DQ_TRIED_TO_SETTLE_CLAIM_URL} from 'routes/urls';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';

export function getGiveUsDetailsClaimantHearingTask(claim: Claim, claimId: string, lang: string): Task {
  const claimantDQ = Object.assign(new DirectionQuestionnaire(), claim.claimantResponse?.directionQuestionnaire);
  const linkUrl = claim.isSmallClaimsTrackDQ ? DETERMINATION_WITHOUT_HEARING_URL : DQ_TRIED_TO_SETTLE_CLAIM_URL;
  const isTaskCompleted = claim.isSmallClaimsTrackDQ ? claimantDQ.isSmallClaimsDQJourneyCompleted : claimantDQ.isFastTrackDQJourneyCompleted;
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, linkUrl),
    status: isTaskCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
}

