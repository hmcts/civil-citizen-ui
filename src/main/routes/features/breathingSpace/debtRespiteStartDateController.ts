import {NextFunction, Request, Response, Router} from 'express';
import {
  BREATHING_SPACE_RESPITE_START_DATE_URL,
  BREATHING_SPACE_RESPITE_TYPE_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  getBreathingSpace,
  saveBreathingSpace,
} from '../../../services/features/breathingSpace/breathingSpaceService';

import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtRespiteStartDate} from '../../../common/models/breathingSpace/debtRespiteStartDate';

const debtRespiteStartDateController = Router();
const debtRespiteStartDateViewPath = 'features/breathingSpace/respite-start';
const breathingSpacePropertyName = 'debtRespiteStartDate';

function renderView(form: GenericForm<DebtRespiteStartDate>, res: Response): void {
  res.render(debtRespiteStartDateViewPath, {form, today: new Date()});
}

debtRespiteStartDateController.get(BREATHING_SPACE_RESPITE_START_DATE_URL, async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const breathingSpace = await getBreathingSpace(claimId);
    const debtStartDate = breathingSpace?.debtRespiteStartDate ?? new DebtRespiteStartDate();
    renderView(new GenericForm(debtStartDate), res);
  } catch (error) {
    next(error);
  }
});

debtRespiteStartDateController.post(BREATHING_SPACE_RESPITE_START_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form =  new GenericForm(new DebtRespiteStartDate(req.body.day, req.body.month, req.body.year));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveBreathingSpace(claimId, form.model, breathingSpacePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_TYPE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default debtRespiteStartDateController;
