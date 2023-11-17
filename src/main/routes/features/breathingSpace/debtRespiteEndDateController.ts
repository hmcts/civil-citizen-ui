import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  BREATHING_SPACE_RESPITE_END_DATE_URL,
  BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
} from '../../../routes/urls';
import {AppRequest} from '../../../common/models/AppRequest';
import {DebtRespiteEndDate} from '../../../common/models/breathingSpace/debtRespiteEndDate';
import {getBreathingSpace, saveBreathingSpace} from '../../../services/features/breathingSpace/breathingSpaceService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {breathingSpaceGuard} from 'routes/guards/breathingSpaceGuard';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';

const debtRespiteEndDateController = Router();
const debtRespiteEndDatePath = 'features/breathingSpace/debt-respite-end-date';

function renderView(form: GenericForm<DebtRespiteEndDate>, res: Response): void {
  res.render(debtRespiteEndDatePath, {
    form,
    today: new Date(),
  });
}

debtRespiteEndDateController.get(BREATHING_SPACE_RESPITE_END_DATE_URL, breathingSpaceGuard, (async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const breathingSpace = await getBreathingSpace(generateRedisKey(req as unknown as AppRequest));
    const debtRespiteEndDate = breathingSpace?.debtRespiteEndDate ?? new DebtRespiteEndDate();
    renderView(new GenericForm(debtRespiteEndDate), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtRespiteEndDateController.post(BREATHING_SPACE_RESPITE_END_DATE_URL, breathingSpaceGuard, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new DebtRespiteEndDate(req.body.day, req.body.month, req.body.year));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const breathingSpacePropertyName = 'debtRespiteEndDate';
      await saveBreathingSpace(generateRedisKey(req as unknown as AppRequest), form.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default debtRespiteEndDateController;
