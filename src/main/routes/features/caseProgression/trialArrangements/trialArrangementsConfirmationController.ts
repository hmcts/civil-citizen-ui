import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,DASHBOARD_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {
  getTrialArrangementsConfirmationContent,
} from 'services/features/caseProgression/trialArrangements/trialArrangementsConfirmationService';
import {YesNo} from 'form/models/yesNo';
import {CaseRole} from 'form/models/caseRoles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const trialArrangementsConfirmationController = Router();

trialArrangementsConfirmationController.get(CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req,true);
    if (!claim.isEmpty()) {
      const readyForTrialOrHearing:boolean = claim.caseRole == CaseRole.CLAIMANT ? claim.caseProgression.claimantTrialArrangements.isCaseReady === YesNo.YES : claim.caseProgression.defendantTrialArrangements.isCaseReady === YesNo.YES;
      const trialArrangementsConfirmationContent = getTrialArrangementsConfirmationContent(claimId, claim, readyForTrialOrHearing);
      const latestUpdateUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);

      res.render('features/caseProgression/trialArrangements/finalise-trial-arrangements-confirmation', {readyForTrialOrHearing, trialArrangementsConfirmationContent, latestUpdateUrl, noCrumbs: true});
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default trialArrangementsConfirmationController;
