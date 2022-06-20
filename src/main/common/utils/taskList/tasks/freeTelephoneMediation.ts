import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../../routes/urls';
import {YesNo} from '../../../../common/form/models/yesNo';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {t} from 'i18next';

export const getFreeTelephoneMediationTask = (caseData: Claim, claimId: string, lang: string): Task => {
  const freeTelephoneMediationTask: Task = {
    description: t('TASK_LIST.RESOLVING_THE_CLAIM.FREE_TELEPHONE_MEDIATION', { lng: getLng(lang) }),
    url: CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
    status: TaskStatus.INCOMPLETE,
  };
  let taskStatus = TaskStatus.INCOMPLETE;

  // Unhappy path NO MEDIATION
  if (caseData.mediation?.mediationDisagreement?.option === YesNo.NO) {
    taskStatus = TaskStatus.COMPLETE;
  } else {
    // Happy path YES MEDIATION
    
    // INDIVIDUAL OR SOLETRADER
    // Use same telephone number for mediation
    if (caseData.mediation?.canWeUse?.option === YesNo.YES) {
      taskStatus = TaskStatus.COMPLETE;
    }
    // Provide new telephone number for mediation
    if (caseData.mediation?.canWeUse?.option === YesNo.NO && caseData.mediation?.canWeUse?.mediationPhoneNumber) {
      taskStatus = TaskStatus.COMPLETE;
    }
  
    // COMPANY OR ORGANISATION
    if (caseData.mediation?.companyTelephoneNumber?.option === YesNo.NO) {
      if(caseData.mediation?.companyTelephoneNumber?.mediationContactPerson && caseData.mediation?.companyTelephoneNumber?.mediationPhoneNumber){
        taskStatus = TaskStatus.COMPLETE;
      }
    }
    if (caseData.mediation?.companyTelephoneNumber?.option === YesNo.YES) {
      if(caseData.mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation){
        taskStatus = TaskStatus.COMPLETE;
      }
    } 

  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  return { ...freeTelephoneMediationTask, url: constructedUrl, status: taskStatus };
};
