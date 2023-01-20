import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Task} from 'models/taskList/task';
import {DETERMINATION_WITHOUT_HEARING_URL} from 'routes/urls';

export function getGiveUsDetailsClaimantHearingTask (_claim: Claim, claimId: string, lang: string): Task {
  // TODO: add task complete logic
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    status: TaskStatus.COMPLETE,
  };
}
