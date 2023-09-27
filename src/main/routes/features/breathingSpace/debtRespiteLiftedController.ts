import {NextFunction, Request, Response, Router} from 'express';
import {
  BREATHING_SPACE_RESPITE_LIFTED_URL,
  BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  saveBreathingSpace,
  getBreathingSpace,
} from '../../../services/features/breathingSpace/breathingSpaceService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import { DebtRespiteStartDate } from 'common/models/breathingSpace/debtRespiteStartDate';
import {breathingSpacGuard} from 'routes/guards/breathingSpacGuard';

const debtRespiteLiftedController = Router();
const debtRespiteLiftDateViewPath = 'features/breathingSpace/debt-respite-lift-date';
const breathingSpacePropertyName = 'debtRespiteLiftDate';

function renderView(form: GenericForm<DebtRespiteStartDate>, res: Response): void {
  res.render(debtRespiteLiftDateViewPath, {form, today: new Date()});
}

debtRespiteLiftedController.get(BREATHING_SPACE_RESPITE_LIFTED_URL, breathingSpacGuard, async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const breathingSpace = await getBreathingSpace(claimId);
    const debtRespiteLiftDate = breathingSpace.debtRespiteLiftDate ?? new DebtRespiteStartDate();
    renderView(new GenericForm(debtRespiteLiftDate), res);
  } catch (error) {
    next(error);
  }
});

debtRespiteLiftedController.post(BREATHING_SPACE_RESPITE_LIFTED_URL, breathingSpacGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteLiftDate = new DebtRespiteStartDate(req.body.day, req.body.month, req.body.year, 'ERRORS.VALID_DATE_LIFT_NOT_AFTER_TODAY');
    const genericForm = new GenericForm(debtRespiteLiftDate);
    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      renderView(genericForm, res);
    } else {
      await saveBreathingSpace(claimId, genericForm.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default debtRespiteLiftedController;
