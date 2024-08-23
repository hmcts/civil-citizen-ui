import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_CANCEL_URL,
  OLD_DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestHandler, Router} from 'express';
import {
  deleteFieldDraftClaimFromStore, 
  generateRedisKey,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import { isCUIReleaseTwoEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

const cancelGeneralApplicationController = Router();

cancelGeneralApplicationController.get(GA_CANCEL_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const propertyName = req.params.propertyName;
    const claim = await getClaimById(claimId, req, true);
    await deleteFieldDraftClaimFromStore(generateRedisKey(<AppRequest>req), claim, propertyName);

    if (claim.isClaimant()) {
      const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
      if (isCUIR2Enabled) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
      }
      res.redirect(constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL));
    }
    res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default cancelGeneralApplicationController;
