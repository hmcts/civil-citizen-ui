import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';

const hasTelephoneMeditationCompleted = (claim: Claim, isClaimantResponse: boolean): boolean => {
  if (isClaimantResponse) {
    return claim.claimantResponse?.mediationCarm?.hasTelephoneMeditationAccessed === undefined ? false : claim.claimantResponse.mediationCarm.hasTelephoneMeditationAccessed;
  }
  return claim.mediationCarm?.hasTelephoneMeditationAccessed === undefined ? false : claim.mediationCarm.hasTelephoneMeditationAccessed;
};

export const getTelephoneMediationTask = (caseData: Claim, claimId: string, lang: string, isClaimantResponse: boolean): Task => {
  const hasTelephoneMediationCompleted = hasTelephoneMeditationCompleted(caseData, isClaimantResponse);
  return {
    description: t('COMMON.TELEPHONE_MEDIATION', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, TELEPHONE_MEDIATION_URL),
    status: hasTelephoneMediationCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};
