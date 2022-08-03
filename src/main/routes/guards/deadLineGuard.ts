import express from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {ResponseOptions} from '../../common/form/models/responseDeadline';
import {isPastDeadline} from '../../common/utils/dateUtils';
import {AdditionalTimeOptions} from '../../common/form/models/additionalTime';
import {getViewOptionsBeforeDeadlineTask} from '../../common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from '../../common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL} from '../../routes/urls';

export const deadLineGuard = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const unauthorized = await isUnauthorized(req);
    if (unauthorized) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const isUnauthorized = async (req: express.Request) => {
  const caseData: Claim = await getCaseDataFromStore(req.params.id);
  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(caseData, req.params.id, 'en');

  const isTaskComplete = viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE; 
  const isDeadlineExtended = caseData.responseDeadline?.option === ResponseOptions.ALREADY_AGREED && caseData.responseDeadline?.agreedResponseDeadline; 
  const isMoreThan28Days = caseData.responseDeadline?.option === ResponseOptions.YES && caseData.responseDeadline?.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS; 
  const isRequestRefused = caseData.responseDeadline?.option === ResponseOptions.REQUEST_REFUSED; 
  const isResponseNo = caseData.responseDeadline?.option === ResponseOptions.NO; 
  
  if (isDeadlinePassed && isTaskComplete && (isMoreThan28Days || isRequestRefused || isResponseNo)) {
    return true;
  }

  if (isTaskComplete && isDeadlineExtended) {
    return true;
  }

  if (isDeadlinePassed && !isTaskComplete) {
    return true;
  }

  return false;
};
