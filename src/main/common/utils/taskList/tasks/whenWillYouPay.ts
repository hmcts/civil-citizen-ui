import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL} from '../../../../routes/urls';
import PaymentOptionType from '../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getWhenWillYouPayTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const whenWillYouPayTask: Task = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.WHEN_WILL_YOU_PAY', {amount: caseData.partialAdmission?.howMuchDoYouOwe?.amount, lng: getLng(lang) }),
    url: CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
    status: TaskStatus.INCOMPLETE,
  };
  let taskStatus = TaskStatus.INCOMPLETE;

  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY) {
    taskStatus = TaskStatus.COMPLETE;
  }
  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE && caseData.partialAdmission?.paymentIntention?.paymentDate) {
    taskStatus = TaskStatus.COMPLETE;
  }
  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS) {
    taskStatus = TaskStatus.COMPLETE;
  }
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
  return { ...whenWillYouPayTask, url: constructedUrl, status: taskStatus };
};
