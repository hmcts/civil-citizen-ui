import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CITIZEN_DETAILS_URL} from 'routes/urls';
import {
  hasAllCarmRequiredFields,
  hasCorrespondenceAndPrimaryAddress,
  hasDateOfBirthIfIndividual,
} from './taskListHelpers';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';

function checkStatus(caseData: Claim, carmApplicable = false ) {
  if(carmApplicable){
    if (hasAllCarmRequiredFields(caseData?.respondent1)) {
      return TaskStatus.COMPLETE;
    }
    return TaskStatus.INCOMPLETE;
  } else if (hasCorrespondenceAndPrimaryAddress(caseData?.respondent1) && hasDateOfBirthIfIndividual(caseData?.respondent1)) {
    return TaskStatus.COMPLETE;
  }
}

export const getConfirmYourDetailsTask = (caseData: Claim, claimId: string, lang: string, carmApplicable = false ): Task => {
  return {
    description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL),
    status: checkStatus(caseData, carmApplicable),
  };
};

