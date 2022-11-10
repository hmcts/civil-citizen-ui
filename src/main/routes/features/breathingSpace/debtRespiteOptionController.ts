import {NextFunction, Request, Response, Router} from 'express';
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

const debtRespiteOptionController = Router();
const debtRespiteOptionViewPath = 'features/breathingSpace/respite-type';
const breathingSpacePropertyName = 'debtRespiteOption';

function renderView(form: GenericForm<DebtRespiteOption>, res: Response): void {
  res.render(debtRespiteOptionViewPath, {form, DebtRespiteOptionType});
}

debtRespiteOptionController.get(BREATHING_SPACE_RESPITE_TYPE_URL, async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const breathingSpace = await getBreathingSpace(claimId);
    renderView(new GenericForm(new DebtRespiteOption(breathingSpace.debtRespiteOption?.type)), res);
  } catch (error) {
    next(error);
  }
});

debtRespiteOptionController.post(BREATHING_SPACE_RESPITE_TYPE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const debtRespiteOption = new DebtRespiteOption(req.body.debtRespiteType);
    const genericForm = new GenericForm(debtRespiteOption);

    genericForm.validateSync();

    if (genericForm.hasErrors()) {
      renderView(genericForm, res);
    } else {
      await saveBreathingSpace(claimId, genericForm.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_END_DATE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default debtRespiteOptionController;
