import express from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {ResponseOptions} from '../../common/form/models/responseDeadline';
import {isPastDeadline} from '../../common/utils/dateUtils';
import {AdditionalTimeOptions} from '../../common/form/models/additionalTime';
import {getViewOptionsBeforeDeadlineTask} from '../../common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from '../../common/models/taskList/TaskStatus';

export const deadLineGuard = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const unauthorized = await isUnauthorized(req)
    if (unauthorized) {
      res.status(401).json("Unauthorized");
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const isUnauthorized = async (req: express.Request) => {
  const caseData: Claim = await getCaseDataFromStore(req.session.claimId);
  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(caseData, req.session.claimId, 'en');

  if (isDeadlinePassed && viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE &&
    ((caseData.responseDeadline?.option === ResponseOptions.YES && caseData.responseDeadline?.additionalTime === AdditionalTimeOptions.MORE_THAN_28_DAYS)
      || caseData.responseDeadline?.option === ResponseOptions.REQUEST_REFUSED
      || caseData.responseDeadline?.option === ResponseOptions.NO)
  ) {
    return true;
  }

  if (viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE
    && caseData.responseDeadline?.option === ResponseOptions.ALREADY_AGREED
    && caseData.responseDeadline?.agreedResponseDeadline) {
    return true;
  }

  if (isDeadlinePassed && viewOptionsBeforeDeadlineTask.status === TaskStatus.INCOMPLETE) {
    return true;
  }

  return false;
}
