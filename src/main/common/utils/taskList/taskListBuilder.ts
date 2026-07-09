import {Task} from 'models/taskList/task';
import {TaskList} from 'models/taskList/taskList';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {getConfirmYourDetailsTask} from './tasks/confirmYourDetails';
import {getViewOptionsBeforeDeadlineTask} from './tasks/viewOptionsBeforeDeadline';
import {getCheckAndSubmitYourResponseTask} from './tasks/checkAndSubmitYourResponse';
import {isPastDeadline} from '../dateUtils';
import {isFullDefenceAndNotCounterClaim} from './tasks/taskListHelpers';
import {ResponseType} from 'common/form/models/responseType';
import {getWhyDisagreeWithAmountClaimedTask} from './tasks/whyDisagreeWithAmountClaimed';
import {getGiveUsDetailsHearingTask} from './tasks/giveUsDetailsHearing';
import {getFreeTelephoneMediationTask} from './tasks/freeTelephoneMediation';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {getTelephoneMediationTask} from 'common/utils/taskList/tasks/telephoneMediation';
import {getAvailabilityForMediationTask} from 'common/utils/taskList/tasks/availabilityForMediation';
import {buildRespondToClaimTasks, isRejectAllAndCounterClaim} from './respondToClaimSectionBuilder';

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

const buildRespondToClaimSection = (caseData: Claim, claimId: string, lang: string): TaskList => {
  const tasks = buildRespondToClaimTasks(caseData, claimId, lang);
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
      tasks.  push(getAvailabilityForMediationTask(caseData, claimId, lang, false));
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
