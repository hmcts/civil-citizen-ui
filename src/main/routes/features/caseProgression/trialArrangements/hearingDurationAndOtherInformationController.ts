import {NextFunction, RequestHandler, Router} from 'express';
import {
  DEFENDANT_SUMMARY_URL, HAS_ANYTHING_CHANGED_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {
  getHearingDurationAndOtherInformation,
} from 'services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation';
import {caseNumberPrettify, removeWhiteSpacesIfNoText} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';

import {OtherTrialInformation} from 'form/models/caseProgression/trialArrangements/otherTrialInformation';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const hearingDurationViewPath = 'features/caseProgression/trialArrangements/hearing-duration-other-info';
const hearingDurationController = Router();
const propertyName = 'otherTrialInformation';
const parentPropertyName = 'defendantTrialArrangements';

hearingDurationController.get([TRIAL_ARRANGEMENTS_HEARING_DURATION], (async (req, res, next: NextFunction) => {
  try {
    const claimId: string = req.params.id;
    const claim: Claim = await getClaimById(claimId, req);
    const claimIdPrettified: string = caseNumberPrettify(req.params.id);
    const hasAnythingChangedUrl: string = constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL);
    const latestUpdatesUrl: string = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const defendantOtherTrialInformation: string = claim.caseProgression?.defendantTrialArrangements?.otherTrialInformation;

    const form = new GenericForm(new OtherTrialInformation(defendantOtherTrialInformation));

    res.render(hearingDurationViewPath, {form: form,
      hearingDurationContents: getHearingDurationAndOtherInformation(claim, claimIdPrettified),
      latestUpdatesUrl: latestUpdatesUrl, hasAnythingChangedUrl: hasAnythingChangedUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingDurationController.post([TRIAL_ARRANGEMENTS_HEARING_DURATION], (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    let otherInfo = req.body.otherInformation;
    otherInfo = removeWhiteSpacesIfNoText(otherInfo);
    const form = new GenericForm(new OtherTrialInformation(otherInfo));
    await saveCaseProgression(claimId, form.model.otherInformation, propertyName, parentPropertyName );

    res.redirect(constructResponseUrlWithIdParams(req.params.id, TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS));

  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default hearingDurationController;
