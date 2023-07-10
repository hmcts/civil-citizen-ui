import {NextFunction, RequestHandler, Router} from 'express';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS, DEFENDANT_SUMMARY_URL
} from '../../../urls';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const finalizeTrialArrangementsViewPath = 'features/caseProgression/trialArrangements/finalise-trial-arrangements';
const finaliseTrialArrangementsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

finaliseTrialArrangementsController.get([CP_FINALISE_TRIAL_ARRANGEMENTS], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const finaliseTrialArrangementNextPageUrl = constructResponseUrlWithIdParams(claimId, CP_FINALISE_TRIAL_ARRANGEMENTS);
    const cancelLinkUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    res.render(finalizeTrialArrangementsViewPath, {finaliseYourTrialContents:getFinaliseTrialArrangementContents(claimId, claim), finaliseTrialArrangementNextPageUrl, cancelLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default finaliseTrialArrangementsController;
