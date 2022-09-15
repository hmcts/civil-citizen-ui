import express from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {isPastDeadline} from '../../common/utils/dateUtils';
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

export const isUnauthorized = async (req: express.Request) => {
  const caseData: Claim = await getCaseDataFromStore(req.params.id);
  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(caseData, req.params.id, 'en');

  const isTaskComplete = viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE;
  const deadlineIsExtended = isTaskComplete && caseData.isDeadlineExtended();
  const isResponseDeadlineExtensionNotQualified = caseData.isRequestToExtendDeadlineRefused() || caseData.isResponseToExtendDeadlineNo() || caseData.hasRespondentAskedForMoreThan28Days();
  const responseDeadlineCantBeExtended = isDeadlinePassed && isTaskComplete && isResponseDeadlineExtensionNotQualified;
  const isTooLateToExtendDeadline = isDeadlinePassed && !isTaskComplete;
  if (responseDeadlineCantBeExtended
    || deadlineIsExtended
  || isTooLateToExtendDeadline) {
    return true;
  }
  return false;
};
