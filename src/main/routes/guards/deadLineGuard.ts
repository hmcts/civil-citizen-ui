import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {isPastDeadline} from '../../common/utils/dateUtils';
import {getViewOptionsBeforeDeadlineTask} from '../../common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {TaskStatus} from '../../common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {RESPONSE_TASK_LIST_URL} from '../../routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {stashClaimOnRequest} from 'common/utils/claimRequestLocals';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';

export const deadLineGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unauthorized = await isUnauthorized(req);
    if (unauthorized) {
      const claimId = getRouteParam(req, 'id');
      res.redirect(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const isUnauthorized = async (req: Request) => {
  const appReq = <AppRequest>req;
  const caseId = getRouteParam(req, 'id');
  const caseData: Claim = await getResponseClaimById(appReq, caseId);
  stashClaimOnRequest(req, caseData);
  const isDeadlinePassed = isPastDeadline(caseData.respondent1ResponseDeadline);
  const viewOptionsBeforeDeadlineTask = getViewOptionsBeforeDeadlineTask(caseData, caseId, 'en');

  const isTaskComplete = viewOptionsBeforeDeadlineTask.status === TaskStatus.COMPLETE;
  const deadlineIsExtended = isTaskComplete && caseData.isDeadlineExtended();
  const isResponseDeadlineExtensionNotQualified = caseData.isRequestToExtendDeadlineRefused() || caseData.isResponseToExtendDeadlineNo() || caseData.hasRespondentAskedForMoreThan28Days();
  const responseDeadlineCantBeExtended = isDeadlinePassed && isTaskComplete && isResponseDeadlineExtensionNotQualified;
  const isTooLateToExtendDeadline = isDeadlinePassed && !isTaskComplete;
  return responseDeadlineCantBeExtended
    || deadlineIsExtended
    || isTooLateToExtendDeadline;
};
