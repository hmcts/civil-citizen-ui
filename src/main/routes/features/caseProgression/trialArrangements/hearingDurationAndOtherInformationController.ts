import {NextFunction, RequestHandler, Router} from 'express';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  DEFENDANT_SUMMARY_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {
  getHearingDurationAndOtherInformation,
} from 'services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";

const hearingDurationViewPath = 'features/caseProgression/trialArrangements/hearing-duration-other-info';
const hearingDurationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

hearingDurationController.get([TRIAL_ARRANGEMENTS_HEARING_DURATION], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const claimIdPrettified = caseNumberPrettify(req.params.id);
    const latestUploadUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    //TODO: check your answers URL will have to be created as part of CIV-9201
    const cyaURL = '';
    res.render(hearingDurationViewPath, {hearingDurationContents:getHearingDurationAndOtherInformation(claim, claimIdPrettified), cyaURL: cyaURL, latestUploadUrl: latestUploadUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingDurationController;
