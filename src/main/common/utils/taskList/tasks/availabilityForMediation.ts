import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {AVAILABILITY_FOR_MEDIATION} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getAvailabilityForMediationTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const availabilityForMediationTask: Task = {
    description: t('COMMON.AVAILABILITY_FOR_MEDIATION', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, AVAILABILITY_FOR_MEDIATION),
    //ToDo: Default to false when page is implemented
    status: TaskStatus.COMPLETE,
  };

  return availabilityForMediationTask;
};
