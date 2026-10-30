import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from 'routes/urls';
import {
  BetweenSixteenAndNineteenDependants,
} from 'form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {
  getForm,
  saveFormToDraftStore,
} from 'services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {hasDisabledChildren} from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const dependantTeenagersViewPath = 'features/response/statementOfMeans/dependants/between_16_and_19';
const betweenSixteenAndNineteenController = Router();

function renderView(form: GenericForm<BetweenSixteenAndNineteenDependants>, res: Response): void {
  res.render(dependantTeenagersViewPath, {form});
}

function convertToForm(req: Request): GenericForm<BetweenSixteenAndNineteenDependants> {
  const value = req.body.value ? Number(req.body.value) : undefined;
  const maxValue = req.body.maxValue ? Number(req.body.maxValue) : undefined;
  return new GenericForm(new BetweenSixteenAndNineteenDependants(value, maxValue));
}

betweenSixteenAndNineteenController.get(CITIZEN_DEPENDANTS_EDUCATION_URL, (async (req, res, next: NextFunction) => {
  try {
    renderView(await getForm(<AppRequest>req), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

betweenSixteenAndNineteenController.post(CITIZEN_DEPENDANTS_EDUCATION_URL, (async (req, res, next: NextFunction) => {
  const caseId = getRouteParam(req, 'id');
  const form = convertToForm(req);
  try {
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const claim = await saveFormToDraftStore(<AppRequest>req, form);
      if (hasDisabledChildren(claim)) {
        res.redirect(constructResponseUrlWithIdParams(caseId, CHILDREN_DISABILITY_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_OTHER_DEPENDANTS_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default betweenSixteenAndNineteenController;
