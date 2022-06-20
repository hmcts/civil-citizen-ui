import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_RESPONSE_TYPE_URL} from '../../../../routes/urls';
import {isCaseDataMissing, isResponseTypeMissing} from './taskListHelpers';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getChooseAResponseTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const chooseAResponseTask = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.CHOOSE_A_RESPONSE', { lng: getLng(lang) }),
    url: CITIZEN_RESPONSE_TYPE_URL,
    status: TaskStatus.INCOMPLETE,
  };
  let taskStatus = TaskStatus.COMPLETE;
  if (isCaseDataMissing(caseData) || isResponseTypeMissing(caseData?.respondent1)) {
    taskStatus = TaskStatus.INCOMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  return { ...chooseAResponseTask, url: constructedUrl, status: taskStatus };
};
