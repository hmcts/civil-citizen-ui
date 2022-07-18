import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

export const getNeedMoreTimeTask = (_claim: Claim, claimId: string, language: string): Task => {
  const needMoreTimeTask = {
    description: t('TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS', { lng: getLng(language) }),
    url: constructResponseUrlWithIdParams(claimId, UNDERSTANDING_RESPONSE_OPTIONS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  /**
  * TODO: add logic to mark task as complete if
  *  - within response deadline
  *  - and either CIV-916 completed
  *  - or CIV-915 - no selection
  *  - or CIV-915 - my request has been refused selection
  **/

  return needMoreTimeTask;
};

