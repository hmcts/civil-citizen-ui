import * as express from 'express';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {CITIZEN_COURT_ORDER_URL, ON_TAX_PAYMENTS_URL} from 'routes/urls';
import {validateForm} from '../../../../../../common/form/validators/formValidator';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from '../../../../../../modules/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = express.Router();

function renderView(form: OnTaxPayments, res: express.Response) {
  res.render(citizenOnTaxPaymentsViewPath, {form: form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, async (req, res) => {
  try {
    const form = await getOnTaxPaymentsForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }

});

onTaxPaymentsController.post(ON_TAX_PAYMENTS_URL, async (req, res) => {
  const form = new OnTaxPayments(req.body.option, Number(req.body.amountYouOwe), req.body.reason);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTaxPaymentsData(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id,CITIZEN_COURT_ORDER_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});
export default onTaxPaymentsController;
