import {Task} from '../../models/taskList/task';
import {TaskList} from '../../models/taskList/taskList';
import {Claim} from '../../models/claim';
import {TaskStatus} from '../../models/taskList/TaskStatus';
import {getConfirmYourDetailsTask} from './tasks/confirmYourDetails';
import {getNeedMoreTimeTask} from './tasks/needMoreTime';
import {getChooseAResponseTask} from './tasks/chooseAResponse';
import {getCheckAndSubmitYourResponseTask} from './tasks/checkAndSubmitYourResponse';
import {isPastDeadline} from '../dateUtils';
import {getDecideHowYouPayTask} from './tasks/decideHowYouPay';
import {getShareFinancialDetailsTask} from './tasks/shareFinancialDetails';
import {getRepaymentPlanTask} from './tasks/repaymentPlan';
import {isNotPayImmediatelyResponse} from './tasks/taskListHelpers';
import PaymentOptionType from '../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';

const buildPrepareYourResponseSection = (claim: Claim, caseData: Claim, claimId:string): TaskList => {
  const tasks: Task[] = [];
  const confirmYourDetailsTask = getConfirmYourDetailsTask(caseData, claimId);
  // TODO : when need more time page is developed we need to generate this function and push this task to the tasks
  const needMoreTimeTask = getNeedMoreTimeTask(claim);

  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  // TODO : when need more page is developed, we also need to check if the posponed deadline is passed if the defendant requested addtional time
  // isDeadlinePassed = isPastDeadline(now, postponedDeadline);
  tasks.push(confirmYourDetailsTask);
  if (!isDeadlinePassed) {
    tasks.push(needMoreTimeTask);
  }
  return { title: 'Prepare your response', tasks };
};

const buildRespondToClaimSection = (caseData: Claim, claimId: string): TaskList => {
  const tasks: Task[] = [];
  const chooseAResponseTask = getChooseAResponseTask(caseData, claimId);
  const decideHowYouPayTask = getDecideHowYouPayTask(caseData, claimId);
  const shareFinancialDetailsTask = getShareFinancialDetailsTask(caseData, claimId);
  const repaymentPlanTask = getRepaymentPlanTask(caseData, claimId);
  tasks.push(chooseAResponseTask);

  // TODO : depending on the response type full admission/partial admission or rejection we need to add new tasks

  if (chooseAResponseTask.status === TaskStatus.COMPLETE) {
    tasks.push(decideHowYouPayTask);

    if (decideHowYouPayTask.status === TaskStatus.COMPLETE && isNotPayImmediatelyResponse(caseData)) {
      tasks.push(shareFinancialDetailsTask);

      if(caseData.paymentOption === PaymentOptionType.INSTALMENTS) {
        tasks.push(repaymentPlanTask);
      }
    }
  }

  return { title: 'Respond to Claim', tasks };
};

const buildSubmitSection = (claimId: string): TaskList => {
  const tasks: Task[] = [];

  // TODO: when check and submit tasks page is developed we need to update logic of this task
  const checkAndSubmitYourResponseTask = getCheckAndSubmitYourResponseTask(claimId);

  tasks.push(checkAndSubmitYourResponseTask);
  return { title: 'Submit', tasks };
};

export {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildSubmitSection,
};
