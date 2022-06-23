import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_DETAILS_URL} from '../../../../routes/urls';
import {isCaseDataMissing, isBothCorrespondenceAndPrimaryAddressMissing, isDOBMissing} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getConfirmYourDetailsTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const confirmYourDetailsTask = {
    description: t('TASK_LIST.PREPARE_YOUR_RESPONSE.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL),
    status: TaskStatus.COMPLETE,
  };
  if (isCaseDataMissing(caseData) || isBothCorrespondenceAndPrimaryAddressMissing(caseData?.respondent1) || isDOBMissing(caseData?.respondent1) ) {
    confirmYourDetailsTask.status = TaskStatus.INCOMPLETE;
  }
  return confirmYourDetailsTask;
};

