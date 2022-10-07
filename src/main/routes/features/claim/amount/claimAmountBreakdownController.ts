import {Router,  Response, Request, NextFunction} from 'express';

import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AmountBreakdown} from '../../../../common/form/models/claim/amount/amountBreakdown';

import {
  getClaimAmountBreakdownForm,
  saveClaimAmountBreakdownForm,
} from '../../../../services/features/claim/amount/claimAmountBreakdownService';
import {AppRequest} from '../../../../common/models/AppRequest';

const claimAmountBreakdownController = Router();
const viewPath = 'features/claim/amount/claim-amount-breakdown';

function renderView(form: GenericForm<AmountBreakdown>, res: Response) {
  res.render(viewPath, {form});
}

claimAmountBreakdownController.get(CLAIM_AMOUNT_URL, async(req: AppRequest, res: Response, next: NextFunction) => {
  try{
    const userid = req.session?.user?.id;
    const form = new GenericForm<AmountBreakdown>( await getClaimAmountBreakdownForm(userid) );
    renderView(form, res);
  }catch(error) {
    next(error);
  }
}).post(CLAIM_AMOUNT_URL, async(req: AppRequest | Request, res: Response, next: NextFunction) => {
  try{
    const form = new GenericForm(AmountBreakdown.fromObject(req.body));
    form.validateSync();
    if(form.hasErrors()) {
      console.log(form.getAllErrors());
      renderView(form, res);
    }else {
      const appRequest = <AppRequest> req;
      await saveClaimAmountBreakdownForm(appRequest.session?.user?.id, form.model);
      res.redirect(CLAIM_INTEREST_URL);
    }
  }catch(error){
    next(error);
  }
});

export default claimAmountBreakdownController;
