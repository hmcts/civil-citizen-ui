import {NextFunction, Request, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_URL, DASHBOARD_URL, CYA_LIFT_BREATHING_SPACE_URL, LIFT_BREATHING_SPACE_EXIT_URL} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {LiftBreathingSpaceForm, STANDARD_BREATHING_SPACE} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from 'services/features/breathingSpace/liftBreathingSpaceService';
import {getHelpSupportLinks, getHelpSupportTitle} from 'services/dashboard/dashboardService';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {ValidationError} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';

const liftBreathingSpaceController = Router();
const liftBreathingSpaceViewPath = 'features/breathingSpace/lift-breathing-space';

const addDateError = (errors: ValidationError[], messageKey: string): void => {
  const error = new ValidationError();
  error.property = 'date';
  error.constraints = {[messageKey]: messageKey};
  errors.push(error);
};

const applyDateBusinessRules = (form: LiftBreathingSpaceForm, errors: ValidationError[]): void => {
  if (!form.date) {
    // Missing fields - date is undefined when any of day/month/year is absent
    addDateError(errors, 'ERRORS.VALID_LIFT_END_DATE_INCLUDE');
  } else if (!isNaN(form.date.getTime())) {
    // Valid date - check business rules
    const daysDiff = getNumberOfDaysBetweenTwoDays(form.startDate, form.date);
    if (daysDiff <= 0) {
      addDateError(errors, 'ERRORS.VALID_LIFT_END_DATE_AFTER_START');
    } else if (form.breathingSpaceType === STANDARD_BREATHING_SPACE && daysDiff > 60) {
      addDateError(errors, 'ERRORS.VALID_LIFT_END_DATE_MAX_60_DAYS');
    }
  }
};

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

    // TODO: replace startDate with actual claim.breathingSpace.enterBreathing.start when JIRA for start date is complete
    const startDate = claim.breathingSpace?.enterBreathing?.start
      ? (() => { const d = new Date(claim.breathingSpace.enterBreathing.start); d.setHours(0,0,0,0); return d; })()
      : (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
    // TODO: replace with actual breathingSpaceType from claim.breathingSpace.enterBreathing.type when dashboard notification ticket is complete
    const breathingSpaceType = STANDARD_BREATHING_SPACE;

    const form = new LiftBreathingSpaceForm(year, month, day, text, startDate, breathingSpaceType);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();

    // Apply date business rules (missing fields, after start date, 60-day limit)
    if (!genericForm.hasFieldError('date')) {
      applyDateBusinessRules(form, genericForm.errors);
    }

    // Remove individual day/month/year field errors when we have a consolidated date error,
    // so the error summary only shows the single date-level message
    if (genericForm.errors.some(e => e.property === 'date')) {
      genericForm.errors = genericForm.errors.filter(e => !['day', 'month', 'year'].includes(e.property));
    }

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
