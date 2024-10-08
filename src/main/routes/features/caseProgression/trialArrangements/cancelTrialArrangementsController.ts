import {CANCEL_TRIAL_ARRANGEMENTS, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestHandler, Router} from 'express';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {CaseRole} from 'form/models/caseRoles';
import {AppRequest} from 'models/AppRequest';

const cancelTrialArrangementsController = Router();

cancelTrialArrangementsController.get([CANCEL_TRIAL_ARRANGEMENTS], (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req,true);
    await deleteDraftClaimFromStore(generateRedisKey(<AppRequest>req));

    if (claim.caseRole === CaseRole.CLAIMANT){
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelTrialArrangementsController;
