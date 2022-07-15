import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {ResponseOptions} from '../../../../common/form/models/responseDeadline';
import {AdditionalTimeOptions} from '../../../../common/form/models/additionalTime';

export const getNeedMoreTimeTask = (claim: Claim, claimId: string, language: string): Task => {
  const needMoreTimeTask = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS', { lng: getLng(language) }),
    url: constructResponseUrlWithIdParams(claimId, UNDERSTANDING_RESPONSE_OPTIONS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  if (claim?.responseDeadline?.option === ResponseOptions.NO
    || claim?.responseDeadline?.option === ResponseOptions.REQUEST_REFUSED
    || claim?.responseDeadline.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS) {
    needMoreTimeTask.status = TaskStatus.COMPLETE;
  }

  // TODO: add further logic to mark task as complete when CIV-916 completed

  return needMoreTimeTask;
};

