import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_RESPITE_LIFTED_URL,
  BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  saveBreathingSpace,
  getBreathingSpace,
} from '../../../services/features/breathingSpace/breathingSpaceService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtRespiteStartDate } from 'common/models/breathingSpace/debtRespiteStartDate';
import {breathingSpaceGuard} from 'routes/guards/breathingSpaceGuard';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const debtRespiteLiftedController = Router();
const debtRespiteLiftDateViewPath = 'features/breathingSpace/debt-respite-lift-date';
const breathingSpacePropertyName = 'debtRespiteLiftDate';

function renderView(form: GenericForm<DebtRespiteStartDate>, res: Response): void {
  res.render(debtRespiteLiftDateViewPath, {form, today: new Date()});
}

debtRespiteLiftedController.get(BREATHING_SPACE_RESPITE_LIFTED_URL, breathingSpaceGuard, (async (req, res, next: NextFunction) => {
  try {
    const breathingSpace = await getBreathingSpace(generateRedisKey(req as unknown as AppRequest));
    const debtRespiteLiftDate = breathingSpace.debtRespiteLiftDate ?? new DebtRespiteStartDate();
    renderView(new GenericForm(debtRespiteLiftDate), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtRespiteLiftedController.post(BREATHING_SPACE_RESPITE_LIFTED_URL, breathingSpaceGuard, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteLiftDate = new DebtRespiteStartDate(req.body.day, req.body.month, req.body.year, 'ERRORS.VALID_DATE_LIFT_NOT_AFTER_TODAY');
    const genericForm = new GenericForm(debtRespiteLiftDate);
    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      renderView(genericForm, res);
    } else {
      await saveBreathingSpace(generateRedisKey(req as unknown as AppRequest), genericForm.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default debtRespiteLiftedController;
