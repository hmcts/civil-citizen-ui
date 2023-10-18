import {NextFunction, Response, Router} from 'express';
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
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = Router();

function renderView(form: GenericForm<OnTaxPayments>, res: Response) {
  res.render(citizenOnTaxPaymentsViewPath, {form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, async (req, res, next: NextFunction) => {
  try {
    renderView(await getOnTaxPaymentsForm(generateRedisKey(<AppRequest>req)), res);
  } catch (error) {
    next(error);
  }
});

onTaxPaymentsController.post(ON_TAX_PAYMENTS_URL, async (req, res, next: NextFunction) => {
  const form = new GenericForm(new OnTaxPayments(req.body.option, Number(req.body.amountYouOwe), req.body.reason));
  try {
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTaxPaymentsData(generateRedisKey(<AppRequest>req), form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default onTaxPaymentsController;
