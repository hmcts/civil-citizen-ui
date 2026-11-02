import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  OnTaxPayments,
} from 'form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {CITIZEN_COURT_ORDERS_URL, ON_TAX_PAYMENTS_URL} from 'routes/urls';
import {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
} from 'services/features/response/statementOfMeans/employment/selfEmployed/onTaxPaymentsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const citizenOnTaxPaymentsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/on-tax-payments';
const onTaxPaymentsController = Router();

function renderView(form: GenericForm<OnTaxPayments>, res: Response) {
  res.render(citizenOnTaxPaymentsViewPath, {form});
}

onTaxPaymentsController.get(ON_TAX_PAYMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    renderView(await getOnTaxPaymentsForm(<AppRequest>req), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

onTaxPaymentsController.post(ON_TAX_PAYMENTS_URL, (async (req, res, next: NextFunction) => {
  const form = new GenericForm(new OnTaxPayments(req.body.option, Number(req.body.amountYouOwe), req.body.reason));
  try {
    const caseId = getRouteParam(req, 'id');
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTaxPaymentsData(<AppRequest>req, form);
      res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_COURT_ORDERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default onTaxPaymentsController;
