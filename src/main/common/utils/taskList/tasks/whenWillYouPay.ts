import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL} from '../../../../routes/urls';
import PaymentOptionType from '../../../../common/form/models/admission/paymentOption/paymentOptionType';

export const getWhenWillYouPayTask = (caseData: Claim, claimId: string): Task => {
  const whenWillYouPayTask: Task = {
    description: `When will you pay the £${caseData.partialAdmission?.howMuchDoYouOwe?.amount}?`,
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
  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
  return { ...whenWillYouPayTask, url: constructedUrl, status: taskStatus };
};
