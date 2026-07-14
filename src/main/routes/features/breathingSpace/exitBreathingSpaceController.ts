import {NextFunction, RequestHandler, Response, Router} from 'express';
import {EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL, EXIT_BREATHING_SPACE_URL} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {ExitBreathingSpaceForm} from 'common/form/models/breathingSpace/exitBreathingSpaceForm';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {BreathingSpaceLiftInfo} from 'models/breathingSpace/breathingSpace';

const exitBreathingSpaceController = Router();
const viewPath = 'features/breathingSpace/exit-breathing-space';

exitBreathingSpaceController.get(EXIT_BREATHING_SPACE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req);
    const breathingSpace = claim.breathingSpace;
    const liftInfo = breathingSpace?.lift;

    // Pre-populate end date for Standard BS: start date + 60 days
    let defaultDay, defaultMonth, defaultYear;
    if (breathingSpace?.enter?.type === 'STANDARD' && breathingSpace?.enter?.start && !liftInfo?.expectedEnd) {
      const defaultEndDate = new Date(breathingSpace.enter.start);
      defaultEndDate.setDate(defaultEndDate.getDate() + 60);
      defaultDay = defaultEndDate.getDate().toString();
      defaultMonth = (defaultEndDate.getMonth() + 1).toString();
      defaultYear = defaultEndDate.getFullYear().toString();
    } else if (liftInfo?.expectedEnd) {
      const date = new Date(liftInfo.expectedEnd);
      defaultDay = date.getDate().toString();
      defaultMonth = (date.getMonth() + 1).toString();
      defaultYear = date.getFullYear().toString();
    }

    const form = new GenericForm(new ExitBreathingSpaceForm(
      defaultDay,
      defaultMonth,
      defaultYear,
      liftInfo?.liftReason,
    ));

    res.render(viewPath, {
      form,
      claimId,
      breathingSpaceType: breathingSpace?.enter?.type,
      startDate: breathingSpace?.enter?.start,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

exitBreathingSpaceController.post(EXIT_BREATHING_SPACE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const {day, month, year, reason} = req.body;
    const claim = await getClaimById(claimId, req);
    const breathingSpace = claim.breathingSpace;

    const exitBreathingSpaceForm = new ExitBreathingSpaceForm(
      day,
      month,
      year,
      reason,
      breathingSpace?.enter?.start ? new Date(breathingSpace.enter.start) : undefined,
      breathingSpace?.enter?.type,
    );
    const form = new GenericForm(exitBreathingSpaceForm);
    form.validateSync();

    if (form.hasErrors()) {
      res.render(viewPath, {
        form,
        claimId,
        breathingSpaceType: breathingSpace?.enter?.type,
        startDate: breathingSpace?.enter?.start,
      });
    } else {
      const draftClaim = await getCaseDataFromStore(claimId);
      if (!draftClaim.breathingSpace) {
        draftClaim.breathingSpace = {};
      }
      if (!draftClaim.breathingSpace.lift) {
        draftClaim.breathingSpace.lift = new BreathingSpaceLiftInfo();
      }
      draftClaim.breathingSpace.lift.expectedEnd = exitBreathingSpaceForm.date;
      draftClaim.breathingSpace.lift.liftReason = exitBreathingSpaceForm.reason;

      await saveDraftClaim(claimId, draftClaim);
      res.redirect(constructResponseUrlWithIdParams(claimId, EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default exitBreathingSpaceController;
