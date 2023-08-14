import {NextFunction, RequestHandler, Router} from 'express';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL} from '../../../urls';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {trialArrangementsGuard} from "routes/guards/caseProgression/trialArragement/trialArrangementsGuard";


const finalizeTrialArrangementsViewPath = 'features/caseProgression/trialArrangements/finalise-trial-arrangements';
const finaliseTrialArrangementsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
//finaliseTrialArrangementsController.use(pageGuardTrialArragement);

finaliseTrialArrangementsController.get([CP_FINALISE_TRIAL_ARRANGEMENTS_URL],trialArrangementsGuard, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(finalizeTrialArrangementsViewPath, {finaliseYourTrialContents:getFinaliseTrialArrangementContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default finaliseTrialArrangementsController;
