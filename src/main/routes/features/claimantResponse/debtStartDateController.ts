import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_WHEN_DEBT_START_URL,
  CLAIMANT_RESPONSE_WHAT_TYPE_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../services/features/claimantResponse/claimantResponseService';

import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {DebtStartDate} from '../../../common/models/claimantResponse/debtStartDate';

const debtStartDateController = Router();
const debtStartDateViewPath = 'features/claimantResponse/debt-when-start';
const claimantResponsePropertyName = 'debtStartDate';

function renderView(form: GenericForm<DebtStartDate>, res: Response): void {
  res.render(debtStartDateViewPath, {form, today: new Date()});
}

debtStartDateController.get(CLAIMANT_RESPONSE_WHEN_DEBT_START_URL, async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const claimantResponse = await getClaimantResponse(claimId);
    const debtStartDate = Object.assign(new DebtStartDate(), claimantResponse.debtStartDate);
    renderView(new GenericForm(debtStartDate), res);
  } catch (error) {
    next(error);
  }
});

debtStartDateController.post(CLAIMANT_RESPONSE_WHEN_DEBT_START_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form =  new GenericForm(new DebtStartDate(req.body.day, req.body.month, req.body.year));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantResponse(claimId, form.model, claimantResponsePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_WHAT_TYPE_URL));
    }
  } catch (error) {
    next(error);
  }
});



export default debtStartDateController;
