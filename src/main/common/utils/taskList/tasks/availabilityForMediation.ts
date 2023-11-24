import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AVAILABILITY_FOR_MEDIATION} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';

const hasAvailabilityMediationFinished = (caseData: Claim): boolean => {
  return caseData.mediation?.hasAvailabilityMediationFinished === undefined ? false : caseData.mediation.hasAvailabilityMediationFinished;
};

export const getAvailabilityForMediationTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const availabilityMediationStatus = hasAvailabilityMediationFinished(caseData);
  return {
    description: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(claimId, AVAILABILITY_FOR_MEDIATION),
    status: availabilityMediationStatus ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};
