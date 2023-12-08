import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';

const hasAvailabilityMediationFinished = (caseData: Claim): boolean => {
  return caseData.mediation?.hasAvailabilityMediationFinished === undefined ? false : caseData.mediation.hasAvailabilityMediationFinished;
};

export const getAvailabilityForMediationTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const availabilityMediationStatus = hasAvailabilityMediationFinished(caseData);
  const url = caseData.isBusiness() ? constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL) :
    constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL);
  return {
    description: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    url: url,
    status: availabilityMediationStatus ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};
