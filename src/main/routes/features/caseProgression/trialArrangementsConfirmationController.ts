import {NextFunction, Router} from 'express';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getTrialArrangementsConfirmationContent,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationService';

const trialArrangementsConfirmationController = Router();

trialArrangementsConfirmationController.get(CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    if (!claim.isEmpty()) {
      const readyForTrialOrHearing = false; // TODO: retrieve the actual value that is selected in CIV-9126
      const trialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, claim, getLng(lang), readyForTrialOrHearing);
      const latestUpdateUrl = DEFENDANT_SUMMARY_URL.replace(':id', claimId);
      res.render('features/caseProgression/trialArrangements/finalise-trial-arrangements-confirmation', {readyForTrialOrHearing, trialArrangementsConfirmationContent, latestUpdateUrl});
    }
  } catch (error) {
    next(error);
  }
});

export default trialArrangementsConfirmationController;
