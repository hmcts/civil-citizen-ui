import {NextFunction, RequestHandler, Router} from 'express';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {

  DEFENDANT_SUMMARY_URL, HAS_ANYTHING_CHANGED_URL,

  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {
  getHearingDurationAndOtherInformation,
} from 'services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';

import {OtherTrialInformation} from 'form/models/caseProgression/trialArrangements/OtherTrialInformation';

const hearingDurationViewPath = 'features/caseProgression/trialArrangements/hearing-duration-other-info';
const hearingDurationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

hearingDurationController.get([TRIAL_ARRANGEMENTS_HEARING_DURATION], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const claimIdPrettified = caseNumberPrettify(req.params.id);
    const hasAnythingChangedUrl = constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL);
    const latestUpdatesUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const defendantOtherTrialInformation = claim.caseProgression?.defendantTrialArrangements?.otherTrialInformation;
    const form = new GenericForm(new OtherTrialInformation(defendantOtherTrialInformation));

    res.render(hearingDurationViewPath, {form: form, hearingDurationContents:getHearingDurationAndOtherInformation(claim, claimIdPrettified), latestUpdatesUrl: latestUpdatesUrl, hasAnythingChangedUrl: hasAnythingChangedUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingDurationController.post([TRIAL_ARRANGEMENTS_HEARING_DURATION], (async (req, res, next) => {
  try {
    //TODO: save trial information using the commented out information below
    //const otherInfo = req.body.otherInformation;
    //const form = new OtherTrialInformation(otherInfo);

    //TODO: check your answers URL will have to be checked as part of CIV-9201
    res.redirect(constructResponseUrlWithIdParams(req.params.id, TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS));

  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default hearingDurationController;
