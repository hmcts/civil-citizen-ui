import {TaskStatus} from '../../../common/models/taskList/TaskStatus';
import {TaskList} from '../../../common/models/taskList/taskList';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {t} from 'i18next';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIM_RESOLVING_DISPUTE_URL} from 'routes/urls';

export const getTaskLists = (caseData: Claim, claimId: string, lang: string) => {

  const taskListConsiderOtherOptions: TaskList = buildConsiderOtherOptions(caseData, claimId, lang);
  const taskListPrepareYourClaim: TaskList = buildPrepareYourClaimSection(caseData, claimId, lang);
  const taskListSubmit: TaskList = buildSubmitSection(caseData, claimId, lang);

  const taskGroups = [taskListConsiderOtherOptions, taskListPrepareYourClaim, taskListSubmit];
  return taskGroups;
  // const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // // check if all tasks are completed except check and submit
  // calculateTotalAndCompleted(taskGroups);
  // const taskListSubmitYourResponse: TaskList = buildSubmitSection(claimId, lang);
  // filteredTaskGroups.push(taskListSubmitYourResponse);
  // return filteredTaskGroups;
};

export const buildConsiderOtherOptions = (caseData: Claim, claimId: string, lang: string): TaskList => {

  const considerOtherOptionsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  // TODO: update status
  if (true) {
    considerOtherOptionsTask.status = TaskStatus.COMPLETE;
  }

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [considerOtherOptionsTask]
  };

  return taskList;
};


export const buildPrepareYourClaimSection = (caseData: Claim, claimId: string, lang: string): TaskList => {

  const completingYourClaimTask = {
    description: t('PAGES.CLAIM_TASK_LIST.COMPLETING_CLAIM', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const yourDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const theirDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.THEIR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const claimAmountTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const claimDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CLAIM_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  // TODO: update status

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.PREPARE_CLAIM'),
    tasks: [
      completingYourClaimTask,
      yourDetailsTask,
      theirDetailsTask,
      claimAmountTask,
      claimDetailsTask,
    ]
  };

  return taskList;
};


export const buildSubmitSection = (caseData: Claim, claimId: string, lang: string): TaskList => {

  const considerOtherOptionsTask = {
    description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  // TODO: update to complete

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [considerOtherOptionsTask]
  };

  return taskList;
};

