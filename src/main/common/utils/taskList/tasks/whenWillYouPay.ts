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
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY) {
    whenWillYouPayTask.status = TaskStatus.COMPLETE;
  }
  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE && caseData.partialAdmission?.paymentIntention?.paymentDate) {
    whenWillYouPayTask.status = TaskStatus.COMPLETE;
  }
  if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS) {
    whenWillYouPayTask.status = TaskStatus.COMPLETE;
  }
  return whenWillYouPayTask;
};
