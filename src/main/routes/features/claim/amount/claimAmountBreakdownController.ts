import {NextFunction, Request, RequestHandler, Response, Router} from 'express';

import {CLAIM_AMOUNT_URL, CLAIM_INTEREST_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AmountBreakdown} from 'form/models/claim/amount/amountBreakdown';

import {
  getClaimAmountBreakdownForm,
  saveClaimAmountBreakdownForm,
} from 'services/features/claim/amount/claimAmountBreakdownService';
import {AppRequest} from 'models/AppRequest';

const claimAmountBreakdownController = Router();
const viewPath = 'features/claim/amount/claim-amount-breakdown';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimAmountBreakdownController');

function renderView(form: GenericForm<AmountBreakdown>, res: Response) {
  res.render(viewPath, {form, pageTitle: 'PAGES.CLAIM_AMOUNT_BREAKDOWN.TITLE'});
}

claimAmountBreakdownController.get(CLAIM_AMOUNT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userid = req.session?.user?.id;
    const form = new GenericForm<AmountBreakdown>(await getClaimAmountBreakdownForm(userid));
    renderView(form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler).post(CLAIM_AMOUNT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(AmountBreakdown.fromObject(req.body));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const userid = req.session?.user?.id;
      logger.info('Claim amount is updated for:', userid);
      await saveAndRedirectToNextPage(<AppRequest>req, res, form.model);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const saveAndRedirectToNextPage = async (req: AppRequest, res: Response, amountBreakdown: AmountBreakdown) => {
  await saveClaimAmountBreakdownForm(req.session?.user?.id, amountBreakdown);
  res.redirect(CLAIM_INTEREST_URL);
};

export default claimAmountBreakdownController;
