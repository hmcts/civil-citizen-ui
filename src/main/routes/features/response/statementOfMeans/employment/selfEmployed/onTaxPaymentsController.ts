import * as express from 'express';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {CITIZEN_COURT_ORDERS_URL, ON_TAX_PAYMENTS_URL} from '../../../../../urls';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from '../../../../../../services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../../common/form/models/genericForm';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = express.Router();

function renderView(taxPaymentsForm: GenericForm<OnTaxPayments>, res: express.Response) {
  const form = Object.assign(taxPaymentsForm);
  form.option = taxPaymentsForm.model.option;
  res.render(citizenOnTaxPaymentsViewPath, {form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, async (req, res, next: express.NextFunction) => {
  try {
    renderView(await getOnTaxPaymentsForm(req.params.id), res);
  } catch (error) {
    next(error);
  }
});

onTaxPaymentsController.post(ON_TAX_PAYMENTS_URL, async (req, res, next: express.NextFunction) => {
  const form = new GenericForm(new OnTaxPayments(req.body.option, Number(req.body.amountYouOwe), req.body.reason));
  try {
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTaxPaymentsData(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default onTaxPaymentsController;
