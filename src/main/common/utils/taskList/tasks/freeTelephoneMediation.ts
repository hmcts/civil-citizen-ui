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
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (caseData.mediation?.mediationDisagreement?.option === YesNo.NO) {
    freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
  } else {
    if (caseData.mediation?.canWeUse?.option === YesNo.YES) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    } else if (caseData.mediation?.canWeUse?.mediationPhoneNumber) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    }
    if (caseData.mediation?.companyTelephoneNumber?.option === YesNo.NO) {
      if (caseData.mediation?.companyTelephoneNumber?.mediationContactPerson && caseData.mediation?.companyTelephoneNumber?.mediationPhoneNumber) {
        freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
      }
    } else if (caseData.mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation) {
      freeTelephoneMediationTask.status = TaskStatus.COMPLETE;
    }
  }

  return freeTelephoneMediationTask;
};
