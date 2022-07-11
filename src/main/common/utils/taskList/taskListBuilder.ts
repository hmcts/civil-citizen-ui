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
import {ResponseType} from '../../../common/form/models/responseType';
import {YesNo} from '../../../common/form/models/yesNo';
import {getHowMuchHaveYouPaidTask} from './tasks/howMuchHaveYouPaid';
import {getWhyDisagreeWithAmountClaimedTask} from './tasks/whyDisagreeWithAmountClaimed';
import {getGiveUsDetailsHearingTask} from './tasks/giveUsDetailsHearing';
import {getHowMuchMoneyAdmitOweTask} from './tasks/howMuchMoneyAdmitOwe';
import {getFreeTelephoneMediationTask} from './tasks/freeTelephoneMediation';
import {getWhenWillYouPayTask} from './tasks/whenWillYouPay';
import PaymentOptionType from '../../../common/form/models/admission/paymentOption/paymentOptionType';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

const buildPrepareYourResponseSection = (claim: Claim, caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];
  const confirmYourDetailsTask = getConfirmYourDetailsTask(caseData, claimId, lang);
  const needMoreTimeTask = getNeedMoreTimeTask(claim, claimId, lang);

  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  // TODO : when need more page is developed, we also need to check if the posponed deadline is passed if the defendant requested addtional time
  tasks.push(confirmYourDetailsTask);
  if (!isDeadlinePassed) {
    tasks.push(needMoreTimeTask);
  }

  return { title: t('TASK_LIST.PREPARE_YOUR_RESPONSE.TITLE', { lng: getLng(lang) }), tasks };
};

const buildRespondToClaimSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];
  const chooseAResponseTask = getChooseAResponseTask(caseData, claimId, lang);
  const decideHowYouPayTask = getDecideHowYouPayTask(caseData, claimId, lang);
  const shareFinancialDetailsTask = getShareFinancialDetailsTask(caseData, claimId, lang);
  const repaymentPlanTask = getRepaymentPlanTask(caseData, claimId, lang);
  const howMuchHaveYouPaidTask = getHowMuchHaveYouPaidTask(caseData, claimId, lang);
  const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, lang);
  const howMuchMoneyAdmitOweTask = getHowMuchMoneyAdmitOweTask(caseData, claimId, lang);
  const whenWillYouPayTask = getWhenWillYouPayTask(caseData, claimId, lang);
  tasks.push(chooseAResponseTask);

  if (chooseAResponseTask.status === TaskStatus.COMPLETE) {

    if (caseData.isFullAdmission()) {
      tasks.push(decideHowYouPayTask);

      if (decideHowYouPayTask.status === TaskStatus.COMPLETE && isNotPayImmediatelyResponse(caseData)) {
        tasks.push(shareFinancialDetailsTask);

        if (caseData.paymentOption === PaymentOptionType.INSTALMENTS) {
          tasks.push(repaymentPlanTask);
        }
      }
    }

    if (caseData.isPartialAdmission()) {

      if (caseData.partialAdmission?.alreadyPaid?.option === YesNo.YES) {
        tasks.push(howMuchHaveYouPaidTask);
      } else if (caseData.partialAdmission?.alreadyPaid?.option === YesNo.NO) {
        tasks.push(howMuchMoneyAdmitOweTask);
        if (caseData.partialAdmission?.howMuchDoYouOwe?.amount) {
          tasks.push(whenWillYouPayTask);
        }
      }

      if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE && caseData.partialAdmission?.paymentIntention?.paymentDate) {
        tasks.push(shareFinancialDetailsTask);
      }

      if (caseData.partialAdmission?.paymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS) {
        tasks.push(shareFinancialDetailsTask);
        tasks.push(repaymentPlanTask);
      }

      tasks.splice(2, 0, whyDisagreeWithAmountClaimedTask);
    }

  }

  return { title: t('TASK_LIST.RESPOND_TO_CLAIM.TITLE', { lng: getLng(lang) }), tasks };
};


const buildResolvingTheClaimSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];
  const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, lang);

  if (whyDisagreeWithAmountClaimedTask.status === TaskStatus.COMPLETE) {
    const freeTelephoneMediationTask = getFreeTelephoneMediationTask(caseData, claimId, lang);
    tasks.push(freeTelephoneMediationTask);
  }
  return { title: t('TASK_LIST.RESOLVING_THE_CLAIM.TITLE', { lng: getLng(lang) }), tasks };
};


const buildYourHearingRequirementsSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];
  if (caseData.respondent1?.responseType === ResponseType.PART_ADMISSION) {
    const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(caseData, claimId, lang);
    tasks.push(giveUsDetailsHearingTask);
  }
  return { title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', { lng: getLng(lang) }), tasks };
};


const buildSubmitSection = (claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];

  // TODO: when check and submit tasks page is developed we need to update logic of this task
  const checkAndSubmitYourResponseTask = getCheckAndSubmitYourResponseTask(claimId, lang);

  tasks.push(checkAndSubmitYourResponseTask);
  return { title: t('TASK_LIST.SUBMIT.TITLE', { lng: getLng(lang) }), tasks };
};

export {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildResolvingTheClaimSection,
  buildYourHearingRequirementsSection,
  buildSubmitSection,
};
