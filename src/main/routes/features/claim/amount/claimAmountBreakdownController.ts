import {Router, Request, Response} from 'express';
import {CLAIM_AMOUNT_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from '../../../../common/form/models/claim/amount/claimAmountRow';

const claimAmountBreakdownController = Router();
const viewPath = 'features/claim/amount/claim-amount-breakdown';

function renderView(form: GenericForm<AmountBreakdown>, res: Response) {
  res.render(viewPath, {form});
}

claimAmountBreakdownController.get(CLAIM_AMOUNT_URL, async(req: Request, res: Response) => {
  const form = new GenericForm<AmountBreakdown>(new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow(), new ClaimAmountRow()]));
  renderView(form, res);
});

export default claimAmountBreakdownController;
