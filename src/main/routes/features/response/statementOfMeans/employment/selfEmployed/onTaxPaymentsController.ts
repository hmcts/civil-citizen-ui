import * as express from 'express';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {ON_TAX_PAYMENTS_URL} from 'routes/urls';
import {validateForm} from '../../../../../../common/form/validators/formValidator';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = express.Router();

function renderView(form: OnTaxPayments, res: express.Response) {
  res.render(citizenOnTaxPaymentsViewPath, {form: form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, async (req, res) => {
  renderView(new OnTaxPayments(), res);
});
onTaxPaymentsController.post(ON_TAX_PAYMENTS_URL, async (req, res) => {
  const form = new OnTaxPayments(req.body.option, Number(req.body.amountYouOwe), req.body.reason);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});
export default onTaxPaymentsController;
