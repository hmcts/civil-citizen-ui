import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BREATHING_SPACE_RESPITE_TYPE_URL,
  BREATHING_SPACE_RESPITE_END_DATE_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';

import {
  saveBreathingSpace,
  getBreathingSpace,
} from '../../../services/features/breathingSpace/breathingSpaceService';

import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtRespiteOption} from '../../../common/models/breathingSpace/debtRespiteOption';
import {DebtRespiteOptionType} from '../../../common/models/breathingSpace/debtRespiteOptionType';
import {breathingSpaceGuard} from 'routes/guards/breathingSpaceGuard';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const debtRespiteOptionController = Router();
const debtRespiteOptionViewPath = 'features/breathingSpace/respite-type';
const breathingSpacePropertyName = 'debtRespiteOption';

function renderView(form: GenericForm<DebtRespiteOption>, res: Response): void {
  res.render(debtRespiteOptionViewPath, {form, DebtRespiteOptionType});
}

debtRespiteOptionController.get(BREATHING_SPACE_RESPITE_TYPE_URL, breathingSpaceGuard, (async (req, res, next: NextFunction) => {
  try {
    const breathingSpace = await getBreathingSpace(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm(new DebtRespiteOption(breathingSpace.debtRespiteOption?.type)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtRespiteOptionController.post(BREATHING_SPACE_RESPITE_TYPE_URL, breathingSpaceGuard, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteOption = new DebtRespiteOption(req.body.debtRespiteType);
    const genericForm = new GenericForm(debtRespiteOption);

    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      renderView(genericForm, res);
    } else {
      await saveBreathingSpace(generateRedisKey(req as unknown as AppRequest), genericForm.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_END_DATE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default debtRespiteOptionController;
