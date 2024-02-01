import {Claim} from 'models/claim';
import {Task} from 'models/taskList/task';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {CLAIMANT_MEDIATION_AVAILABILITY, CLAIMANT_TELEPHONE_MEDIATION} from 'routes/urls';

export function getClaimantTelephoneMediationTask(claim: Claim, claimId: string, lang: string): Task {
  const telephoneMediationTask = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.MEDIATION.TELEPHONE_MEDIATION', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_TELEPHONE_MEDIATION),
    status: TaskStatus.INCOMPLETE,
  };
  return telephoneMediationTask;
}

export function getClaimantMediationAvailabilityTask(claim: Claim, claimId: string, lang: string): Task {
  const mediationAvailability = {
    description: t('CLAIMANT_RESPONSE_TASK_LIST.MEDIATION.MEDIATION_AVAILABILITY', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, CLAIMANT_MEDIATION_AVAILABILITY),
    status: TaskStatus.INCOMPLETE,
  };
  return mediationAvailability;
}
