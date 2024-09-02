import {NextFunction, Request, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {isJudgmentOnlineLive} from '../../app/auth/launchdarkly/launchDarklyClient';

export const ccjConfirmationGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, <AppRequest>req, true);
    const isJudgmentOnlineLiveOn = await isJudgmentOnlineLive();
    if (claim.isCCJComplete() || claim.isCCJCompleteForJo(isJudgmentOnlineLiveOn)) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
};
