import {NextFunction, RequestHandler, Router} from 'express';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CaseRole} from 'form/models/caseRoles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const finalizeTrialArrangementsViewPath = 'features/caseProgression/trialArrangements/finalise-trial-arrangements';
const finaliseTrialArrangementsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

finaliseTrialArrangementsController.get([CP_FINALISE_TRIAL_ARRANGEMENTS_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    await saveDraftClaim(redisKey, claim);

    const dashboardUrl = claim.caseRole === CaseRole.CLAIMANT ? constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL) : constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);

    res.render(finalizeTrialArrangementsViewPath, {finaliseYourTrialContents:getFinaliseTrialArrangementContents(claimId, claim, lang),dashboardUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default finaliseTrialArrangementsController;
