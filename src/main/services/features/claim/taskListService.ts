import {t} from 'i18next';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIM_RESOLVING_DISPUTE_URL} from 'routes/urls';

export const getTaskLists = (caseData: Claim, userId: string, lang: string) => {
  const taskListConsiderOtherOptions: TaskList = buildConsiderOtherOptions(caseData, userId, lang);
  // const taskListPrepareYourClaim: TaskList = buildPrepareYourClaimSection(caseData, userId, lang);
  // const taskListSubmit: TaskList = buildSubmitSection(caseData, userId, lang);

  const taskGroups: TaskList[] = [
    taskListConsiderOtherOptions, 
    // taskListPrepareYourClaim, 
    // taskListSubmit,
  ];
  return taskGroups;
};

export const buildConsiderOtherOptions = (caseData: Claim, userId: string, lang: string): TaskList => {
  
  const considerOtherOptionsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.resolvingDispute) {
    considerOtherOptionsTask.status = TaskStatus.COMPLETE;
  }

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [considerOtherOptionsTask]
  };

  return taskList;
};


// export const buildPrepareYourClaimSection = (caseData: Claim, userId: string, lang: string): TaskList => {

//   const completingYourClaimTask = {
//     description: t('PAGES.CLAIM_TASK_LIST.COMPLETING_CLAIM', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const yourDetailsTask = {
//     description: t('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const theirDetailsTask = {
//     description: t('PAGES.CLAIM_TASK_LIST.THEIR_DETAILS', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const claimAmountTask = {
//     description: t('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const claimDetailsTask = {
//     description: t('PAGES.CLAIM_TASK_LIST.CLAIM_DETAILS', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const taskList: TaskList = {
//     title: t('PAGES.CLAIM_TASK_LIST.PREPARE_CLAIM'),
//     tasks: [
//       completingYourClaimTask,
//       yourDetailsTask,
//       theirDetailsTask,
//       claimAmountTask,
//       claimDetailsTask,
//     ]
//   };

//   return taskList;
// };

// export const buildSubmitSection = (caseData: Claim, userId: string, lang: string): TaskList => {

//   const considerOtherOptionsTask = {
//     description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
//     url: constructResponseUrlWithIdParams(userId, CLAIMANT_TASK_LIST_URL),
//     status: TaskStatus.INCOMPLETE,
//   };

//   const taskList: TaskList = {
//     title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
//     tasks: [considerOtherOptionsTask]
//   };

//   return taskList;
// };
