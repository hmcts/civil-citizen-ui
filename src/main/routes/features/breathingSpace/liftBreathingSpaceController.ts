import {NextFunction, Request, Response, Router} from 'express';
import {LIFT_BREATHING_SPACE_URL, DASHBOARD_CLAIMANT_URL} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {LiftBreathingSpaceForm} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from 'services/features/breathingSpace/liftBreathingSpaceService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';

const liftBreathingSpaceController = Router();
const liftBreathingSpaceViewPath = 'features/breathingSpace/lift-breathing-space';

liftBreathingSpaceController.get(LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const claim = await getClaimById(claimId, req, true);
    const form = await getLiftBreathingSpaceForm(claimId, claim);
    res.render(liftBreathingSpaceViewPath, {form: new GenericForm(form)});
  } catch (error) {
    next(error);
  }
});

liftBreathingSpaceController.post(LIFT_BREATHING_SPACE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id as string;
    const claim = await getClaimById(claimId, req, true);
    const {year, month, day, text} = req.body;
    const form = new LiftBreathingSpaceForm(year, month, day, text);
    const genericForm = new GenericForm(form);
    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      res.render(liftBreathingSpaceViewPath, {form: genericForm});
    } else {
      await saveLiftBreathingSpace(claimId, claim, form);
      res.redirect(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default liftBreathingSpaceController;
