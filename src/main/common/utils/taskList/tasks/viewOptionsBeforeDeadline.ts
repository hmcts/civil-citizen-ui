import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {t} from 'i18next';
import {getLng} from '../../languageToggleUtils';
import {NEW_RESPONSE_DEADLINE_URL, UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../urlFormatter';
import {ResponseOptions} from '../../../form/models/responseDeadline';
import {AdditionalTimeOptions} from '../../../form/models/additionalTime';
import {isPastDeadline} from '../../dateUtils';

export const getViewOptionsBeforeDeadlineTask = (claim: Claim, claimId: string, language: string): Task => {
  const viewOptionsBeforeDeadlineTask = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS', { lng: getLng(language) }),
    url: constructResponseUrlWithIdParams(claimId, UNDERSTANDING_RESPONSE_OPTIONS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const isDeadlinePassed = isPastDeadline(claim.respondent1ResponseDeadline);

  switch (claim.responseDeadline?.option) {
    case ResponseOptions.YES:
      if (claim.responseDeadline?.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS) {
        viewOptionsBeforeDeadlineTask.status = TaskStatus.COMPLETE;
        if(isDeadlinePassed){
          viewOptionsBeforeDeadlineTask.url = '#';
        }
      }
      break;
    case ResponseOptions.ALREADY_AGREED:
      if (claim.responseDeadline?.agreedResponseDeadline) {
        viewOptionsBeforeDeadlineTask.status = TaskStatus.COMPLETE;
        viewOptionsBeforeDeadlineTask.url = constructResponseUrlWithIdParams(claimId, NEW_RESPONSE_DEADLINE_URL);
      }
      break;
    case ResponseOptions.REQUEST_REFUSED:
    case ResponseOptions.NO:
      viewOptionsBeforeDeadlineTask.status = TaskStatus.COMPLETE;
      if(isDeadlinePassed){
        viewOptionsBeforeDeadlineTask.url = '#';
      }
      break;
    default:
      viewOptionsBeforeDeadlineTask.status = TaskStatus.INCOMPLETE;
      break;
  }

  return viewOptionsBeforeDeadlineTask;
};
