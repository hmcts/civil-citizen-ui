import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL
} from '../../../../routes/urls';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';
import {ResponseType} from '../../../../common/form/models/responseType';

export const getWhyDisagreeWithAmountClaimedTask = (caseData: Claim, claimId: string, responseType: string, lang: string): Task => {

  const url = responseType === ResponseType.PART_ADMISSION
    ? constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL)
    : constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL);

  const whyDisagreeWithAmountClaimed: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }),
    url,
    status: TaskStatus.INCOMPLETE,
  };

  if (responseType === ResponseType.PART_ADMISSION && caseData.partialAdmission?.whyDoYouDisagree?.text) {
    whyDisagreeWithAmountClaimed.status = TaskStatus.COMPLETE;
  }

  if (responseType === ResponseType.FULL_DEFENCE && caseData.rejectAllOfClaim?.whyDoYouDisagree?.text) {
    whyDisagreeWithAmountClaimed.status = TaskStatus.COMPLETE;
  }

  return whyDisagreeWithAmountClaimed;
};
