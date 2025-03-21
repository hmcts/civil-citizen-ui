import {Task} from 'models/taskList/task';
import {TaskList} from 'models/taskList/taskList';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getConfirmYourDetailsTask} from './tasks/confirmYourDetails';
import {getViewOptionsBeforeDeadlineTask} from './tasks/viewOptionsBeforeDeadline';
import {getChooseAResponseTask} from './tasks/chooseAResponse';
import {getCheckAndSubmitYourResponseTask} from './tasks/checkAndSubmitYourResponse';
import {isPastDeadline} from '../dateUtils';
import {getDecideHowYouPayTask} from './tasks/decideHowYouPay';
import {getShareFinancialDetailsTask} from './tasks/shareFinancialDetails';
import {getRepaymentPlanTask} from './tasks/repaymentPlan';
import {isFullDefenceAndNotCounterClaim, isNotPayImmediatelyResponse} from './tasks/taskListHelpers';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo} from 'common/form/models/yesNo';
import {getHowMuchHaveYouPaidTask} from './tasks/howMuchHaveYouPaid';
import {getWhyDisagreeWithAmountClaimedTask} from './tasks/whyDisagreeWithAmountClaimed';
import {getGiveUsDetailsHearingTask} from './tasks/giveUsDetailsHearing';
import {getHowMuchMoneyAdmitOweTask} from './tasks/howMuchMoneyAdmitOwe';
import {getFreeTelephoneMediationTask} from './tasks/freeTelephoneMediation';
import {getWhenWillYouPayTask} from './tasks/whenWillYouPay';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {getTellUsHowMuchYouHavePaidTask} from './tasks/tellUsHowMuchYouHavePaid';
import {getTellUsWhyDisagreeWithClaimTask} from './tasks/tellUsWhyDisagreeWithClaim';
import {getTelephoneMediationTask} from 'common/utils/taskList/tasks/telephoneMediation';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';

const buildPrepareYourResponseSection = (caseData: Claim, claimId: string, lang: string, carmApplicable = false): TaskList => {
  const tasks: Task[] = [];
  const confirmYourDetailsTask = getConfirmYourDetailsTask(caseData, claimId, lang, carmApplicable);
  const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(caseData, claimId, lang);

  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  // TODO : when need more page is developed, we also need to check if the posponed deadline is passed if the defendant requested addtional time
  tasks.push(confirmYourDetailsTask);
  if (!isDeadlinePassed || viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE) {
    tasks.push(viewOptionsBeforeDeadlineTask);
  }

  return {title: t('TASK_LIST.PREPARE_YOUR_RESPONSE.TITLE', {lng: getLng(lang)}), tasks};
};

const isRejectAllAndCounterClaim = (caseData: Claim): boolean => {
  return caseData.rejectAllOfClaim?.option === RejectAllOfClaimType.COUNTER_CLAIM;
};

const buildRespondToClaimSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];
  const chooseAResponseTask = getChooseAResponseTask(caseData, claimId, lang);
  const decideHowYouPayTask = getDecideHowYouPayTask(caseData, claimId, lang);
  const shareFinancialDetailsTask = getShareFinancialDetailsTask(caseData, claimId, lang);
  const repaymentPlanTask = getRepaymentPlanTask(caseData, claimId, lang);
  const howMuchHaveYouPaidTask = getHowMuchHaveYouPaidTask(caseData, claimId, lang);
  const howMuchMoneyAdmitOweTask = getHowMuchMoneyAdmitOweTask(caseData, claimId, lang);
  const whenWillYouPayTask = getWhenWillYouPayTask(caseData, claimId, lang);
  const tellUsHowMuchYouHavePaidTask = getTellUsHowMuchYouHavePaidTask(caseData, claimId, lang);
  const tellUsWhyDisagreeWithClaimTask = getTellUsWhyDisagreeWithClaimTask(caseData, claimId, lang);

  if (isRejectAllAndCounterClaim(caseData)) {
    chooseAResponseTask.status = TaskStatus.INCOMPLETE;
  }

  tasks.push(chooseAResponseTask);

  if (chooseAResponseTask.status === TaskStatus.COMPLETE) {

    if (caseData.isFullAdmission()) {
      tasks.push(decideHowYouPayTask);

      if (decideHowYouPayTask.status === TaskStatus.COMPLETE && isNotPayImmediatelyResponse(caseData)) {
        tasks.push(shareFinancialDetailsTask);

        if(caseData.isFAPaymentOptionInstallments()) {
          tasks.push(repaymentPlanTask);
        }
      }
    }

    if (caseData.isPartialAdmission()) {
      const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.PART_ADMISSION, lang);

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

    if (caseData.isFullDefence()) {
      if (caseData.hasConfirmedAlreadyPaid()) {
        tasks.push(tellUsHowMuchYouHavePaidTask);
        if (caseData.rejectAllOfClaim?.howMuchHaveYouPaid?.amount < caseData.totalClaimAmount) {
          const whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.FULL_DEFENCE, lang);
          tasks.push(whyDisagreeWithAmountClaimedTask);
        }
      } else if (caseData.isRejectAllOfClaimDispute()) {
        tasks.push(tellUsWhyDisagreeWithClaimTask);
      }
    }
  }

  return {title: t('TASK_LIST.RESPOND_TO_CLAIM.TITLE', {lng: getLng(lang)}), tasks};
};

const buildResolvingTheClaimSection = (caseData: Claim, claimId: string, lang: string, carmApplicable = false): TaskList => {
  const tasks: Task[] = [];

  let whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.PART_ADMISSION, lang);

  if (caseData.isFullDefence()) {
    whyDisagreeWithAmountClaimedTask = getWhyDisagreeWithAmountClaimedTask(caseData, claimId, ResponseType.FULL_DEFENCE, lang);
  }

  if (caseData.isSmallClaimsTrackDQ && (whyDisagreeWithAmountClaimedTask.status === TaskStatus.COMPLETE || isFullDefenceAndNotCounterClaim(caseData))) {
    if(carmApplicable) {
      tasks.push(getTelephoneMediationTask(caseData, claimId, lang, false));
      tasks.push(getAvailabilityForMediationTask(caseData, claimId, lang, false));
    } else {
      tasks.push(getFreeTelephoneMediationTask(caseData, claimId, lang));
    }
  }

  return {title: t('TASK_LIST.RESOLVING_THE_CLAIM.TITLE', {lng: getLng(lang)}), tasks};
};

const buildYourHearingRequirementsSection = (caseData: Claim, claimId: string, lang: string, mintiApplicable: boolean): TaskList => {
  const tasks: Task[] = [];
  if (caseData.isPartialAdmission() || isFullDefenceAndNotCounterClaim(caseData)) {
    const giveUsDetailsHearingTask = getGiveUsDetailsHearingTask(caseData, claimId, lang, mintiApplicable);
    tasks.push(giveUsDetailsHearingTask);
  }
  return {title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng: getLng(lang)}), tasks};
};

const buildSubmitSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks: Task[] = [];

  const checkAndSubmitYourResponseTask = getCheckAndSubmitYourResponseTask(claimId, lang);

  if (isRejectAllAndCounterClaim(caseData)) {
    delete checkAndSubmitYourResponseTask.url;
  }

  tasks.push(checkAndSubmitYourResponseTask);
  return {title: t('TASK_LIST.SUBMIT.TITLE', {lng: getLng(lang)}), tasks};
};

export {
  buildPrepareYourResponseSection,
  buildRespondToClaimSection,
  buildResolvingTheClaimSection,
  buildYourHearingRequirementsSection,
  buildSubmitSection,
};