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

export const getGiveUsDetailsHearingTask = (claim: Claim, claimId: string, lang: string): Task => {
  const defendantDQ = Object.assign(new DirectionQuestionnaire(), claim.directionQuestionnaire);
  const linkUrl = !claim.isSmallClaimsTrackDQ ? DQ_TRIED_TO_SETTLE_CLAIM_URL : DETERMINATION_WITHOUT_HEARING_URL;
  const isTaskCompleted = claim.isSmallClaimsTrackDQ ? defendantDQ.isSmallClaimsDQJourneyCompleted : defendantDQ.isFastTrackDQJourneyCompleted;
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, linkUrl),
    status: isTaskCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};
