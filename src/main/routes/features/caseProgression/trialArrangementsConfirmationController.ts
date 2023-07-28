import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getTrialArrangementsConfirmationContent,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationService';
import {YesNo} from 'form/models/yesNo';

const trialArrangementsConfirmationController = Router();

trialArrangementsConfirmationController.get(CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    if (!claim.isEmpty()) {
      const readyForTrialOrHearing:boolean = claim.caseProgression.isCaseReadyTrialOrHearing.option === YesNo.YES;      const trialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, claim, getLng(lang), readyForTrialOrHearing);
      const latestUpdateUrl = DEFENDANT_SUMMARY_URL.replace(':id', claimId);
      res.render('features/caseProgression/trialArrangements/finalise-trial-arrangements-confirmation', {readyForTrialOrHearing, trialArrangementsConfirmationContent, latestUpdateUrl});
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default trialArrangementsConfirmationController;
