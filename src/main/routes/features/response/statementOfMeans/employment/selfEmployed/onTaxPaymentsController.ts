import * as express from 'express';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {ON_TAX_PAYMENTS_URL} from 'routes/urls';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = express.Router();

function renderView(form: OnTaxPayments, res: express.Response) {
  res.render(citizenOnTaxPaymentsViewPath, {form: form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, async (req, res) => {
  renderView(new OnTaxPayments(), res);
});

export default onTaxPaymentsController;
