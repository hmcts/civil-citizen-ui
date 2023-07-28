import {t} from 'i18next';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIM_AMOUNT_URL,
  CLAIM_CHECK_ANSWERS_URL,
  CLAIM_COMPLETING_CLAIM_URL,
  CLAIM_DEFENDANT_PARTY_TYPE_URL,
  CLAIM_REASON_URL,
  CLAIM_RESOLVING_DISPUTE_URL,
} from 'routes/urls';
import { YesNo } from 'common/form/models/yesNo';
import { InterestClaimOptionsType } from 'common/form/models/claim/interest/interestClaimOptionsType';
import { InterestClaimFromType } from 'common/form/models/claimDetails';

export const getTaskLists = (caseData: Claim, userId: string, lang: string): TaskList[] => {
  const taskListConsiderOtherOptions: TaskList = buildConsiderOtherOptions( caseData, userId, lang);
  const taskListPrepareYourClaim: TaskList = buildPrepareYourClaimSection(caseData, userId, lang);
  const taskListSubmit: TaskList = buildSubmitSection(caseData, userId, lang);

  const taskGroups: TaskList[] = [
    taskListConsiderOtherOptions,
    taskListPrepareYourClaim,
    taskListSubmit,
  ];

  return taskGroups;
};

export const buildConsiderOtherOptions = (caseData: Claim, userId: string, lang: string): TaskList => {
  const considerOtherOptionsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.RESOLVING_DISPUTE', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_RESOLVING_DISPUTE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.resolvingDispute) {
    considerOtherOptionsTask.status = TaskStatus.COMPLETE;
  }

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS'),
    tasks: [considerOtherOptionsTask],
  };

  return taskList;
};

export const buildPrepareYourClaimSection = (caseData: Claim, userId: string, lang: string): TaskList => {
  const completingYourClaimTask = {
    description: t('PAGES.CLAIM_TASK_LIST.COMPLETING_CLAIM', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_COMPLETING_CLAIM_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.completingClaimConfirmed) {
    completingYourClaimTask.status = TaskStatus.COMPLETE;
  }

  const yourDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIMANT_PARTY_TYPE_SELECTION_URL),
    status: TaskStatus.INCOMPLETE,
  };

  console.log('userId: ', userId);
  // TODO DOB doesnt work
  if (caseData.respondent1?.type) {
    if (
      (caseData.isBusiness() && caseData.respondent1?.partyDetails?.partyName) || 
      (!caseData.isBusiness() && caseData.respondent1?.partyDetails?.individualFirstName && caseData.applicant1?.dateOfBirth?.date)
    ) {
      yourDetailsTask.status = TaskStatus.COMPLETE;
    }
  }

  const theirDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.THEIR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_DEFENDANT_PARTY_TYPE_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.respondent1?.type) {
    if (
      (caseData.isBusiness() && caseData.respondent1?.partyDetails?.partyName) || 
      (!caseData.isBusiness() && caseData.respondent1?.partyDetails?.individualFirstName)
    ) {
      theirDetailsTask.status = TaskStatus.COMPLETE;
    }
  }

  const claimAmountTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_AMOUNT_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.claimAmountBreakup && caseData.claimDetails?.helpWithFees?.option) {
    if (caseData.claimInterest = YesNo.NO) {
      claimAmountTask.status = TaskStatus.COMPLETE;
    } else {
      if (
        caseData.interest?.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST &&
        caseData.interest?.totalInterest?.amount &&
        caseData.interest?.totalInterest?.reason
        ) {
        claimAmountTask.status = TaskStatus.COMPLETE;
      } else if (
        caseData.interest?.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST &&
        caseData.interest?.sameRateInterestSelection?.sameRateInterestType &&
        (
          caseData.interest?.interestClaimFrom === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE || 
          (
            caseData.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE && 
            caseData.interest?.interestStartDate && 
            caseData.interest?.interestEndDate
          )
        )
        ) {
        claimAmountTask.status = TaskStatus.COMPLETE;
      }
    }
  }

  const claimDetailsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CLAIM_DETAILS', { lng: getLng(lang)}),
    url: constructResponseUrlWithIdParams(userId, CLAIM_REASON_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if(caseData.claimDetails?.reason && caseData.claimDetails?.timeline?.rows?.length){
    claimDetailsTask.status = TaskStatus.COMPLETE
  }

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.PREPARE_CLAIM'),
    tasks: [
      completingYourClaimTask,
      yourDetailsTask,
      theirDetailsTask,
      claimAmountTask,
      claimDetailsTask,
    ],
  };

  return taskList;
};

export const buildSubmitSection = (caseData: Claim, userId: string, lang: string): TaskList => {
  const considerOtherOptionsTask = {
    description: t('PAGES.CLAIM_TASK_LIST.CHECK_AND_SUBMIT', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(userId, CLAIM_CHECK_ANSWERS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const taskList: TaskList = {
    title: t('PAGES.CLAIM_TASK_LIST.SUBMIT'),
    tasks: [considerOtherOptionsTask],
  };

  return taskList;
};
