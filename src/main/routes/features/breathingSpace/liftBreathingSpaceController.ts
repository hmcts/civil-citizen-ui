import {NextFunction, Request, Response, Router} from 'express';
import {
  BREATHING_SPACE_LIFT_URL,
  CYA_LIFT_BREATHING_SPACE_URL,
  LIFT_BREATHING_SPACE_EXIT_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {LiftBreathingSpaceForm, STANDARD_BREATHING_SPACE} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {
  getBreathingSpaceEnterStartDate,
  getLiftBreathingSpaceForm,
  saveLiftBreathingSpace,
} from 'services/features/breathingSpace/liftBreathingSpaceService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ValidationError} from 'class-validator';
import {AppRequest} from 'models/AppRequest';

const liftBreathingSpaceController = Router();
const liftBreathingSpaceViewPath = 'features/breathingSpace/lift-breathing-space';

const addDateError = (errors: ValidationError[], messageKey: string): void => {
  const error = new ValidationError();
  error.property = 'date';
  error.constraints = {[messageKey]: messageKey};
  errors.push(error);
};

const applyMissingEndDateRule = (form: LiftBreathingSpaceForm, errors: ValidationError[]): boolean => {
  if (form.date) {
    return false;
  }
  if (form.breathingSpaceType && form.breathingSpaceType !== STANDARD_BREATHING_SPACE) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    form.date = today;
    form.day = today.getDate();
    form.month = today.getMonth() + 1;
    form.year = today.getFullYear();
    return true;
  }
  addDateError(errors, 'ERRORS.VALID_LIFT_END_DATE_INCLUDE');
  return false;
};

liftBreathingSpaceController.get(BREATHING_SPACE_LIFT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const form = await getLiftBreathingSpaceForm(claimId, claim);
    const helpSupportTitle = getHelpSupportTitle(lang);
    const helpSupportLinks = getHelpSupportLinks(lang);
    const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    const liftUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);
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

liftBreathingSpaceController.post(BREATHING_SPACE_LIFT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const {year, month, day, text} = req.body;

    const startDate = getBreathingSpaceEnterStartDate(claim);
    const breathingSpaceType = claim.enterBreathing?.type ?? claim.breathingSpace?.enterBreathing?.type;

    const form = new LiftBreathingSpaceForm(year, month, day, text, startDate, breathingSpaceType);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();

    if (!genericForm.errors.some(e => e.property === 'date')
      && applyMissingEndDateRule(form, genericForm.errors)) {
      genericForm.validateSync();
    }

    if (genericForm.errors.some(e => e.property === 'date')) {
      genericForm.errors = genericForm.errors.filter(e => !['day', 'month', 'year'].includes(e.property));
    }

    if (genericForm.hasErrors()) {
      const helpSupportTitle = getHelpSupportTitle(lang);
      const helpSupportLinks = getHelpSupportLinks(lang);
      const backUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
      const liftUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_LIFT_URL);
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
      await saveLiftBreathingSpace(generateRedisKey(req as AppRequest), claim, form);
      const redirectUrl = constructResponseUrlWithIdParams(claimId, CYA_LIFT_BREATHING_SPACE_URL);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceController;
