import {NextFunction, Request, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_URL, DASHBOARD_URL, CYA_LIFT_BREATHING_SPACE_URL, LIFT_BREATHING_SPACE_EXIT_URL} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {LiftBreathingSpaceForm} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from 'services/features/breathingSpace/liftBreathingSpaceService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';

const liftBreathingSpaceController = Router();
const liftBreathingSpaceViewPath = 'features/breathingSpace/lift-breathing-space';

liftBreathingSpaceController.get(LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const form = await getLiftBreathingSpaceForm(claimId, claim);
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);
    const liftUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
    const exitUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_EXIT_URL) + '?returnUrl=' + encodeURIComponent(liftUrl);
    const isQMFlagEnabled = await isQueryManagementEnabled(claim.submittedDate);

    res.render(liftBreathingSpaceViewPath, {
      form: new GenericForm(form),
      claim,
      claimId,
      helpSupportTitle,
      helpSupportLinks,
      backUrl,
      backLinkUrl: backUrl,
      exitUrl,
      isQMFlagEnabled,
      showErrorSummary: false,
    });
  } catch (error) {
    next(error);
  }
});

liftBreathingSpaceController.post(LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const {year, month, day, text} = req.body;
    const form = new LiftBreathingSpaceForm(year, month, day, text);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      const helpSupportTitle = getHelpSupportTitle(lang);
      const helpSupportLinks = getHelpSupportLinks(lang);
      const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);
      const liftUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
      const exitUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_EXIT_URL) + '?returnUrl=' + encodeURIComponent(liftUrl);
      const isQMFlagEnabled = await isQueryManagementEnabled(claim.submittedDate);

      res.render(liftBreathingSpaceViewPath, {
        form: genericForm,
        claim,
        claimId,
        helpSupportTitle,
        helpSupportLinks,
        backUrl,
        backLinkUrl: backUrl,
        exitUrl,
        isQMFlagEnabled,
        showErrorSummary: true,
      });
    } else {
      await saveLiftBreathingSpace(claimId, claim, form);
      const redirectUrl = constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceController;
