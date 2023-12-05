import {NextFunction, Request, Response, Router} from 'express';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../routes/urls';
import {
  BetweenSixteenAndNineteenDependants,
} from '../../../../../common/form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {
  getForm,
  saveFormToDraftStore,
} from '../../../../../services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {hasDisabledChildren} from '../../../../../services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

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

betweenSixteenAndNineteenController.get(CITIZEN_DEPENDANTS_EDUCATION_URL, async (req, res, next: NextFunction) => {
  try {
    renderView(await getForm(generateRedisKey(<AppRequest>req)), res);
  } catch (error) {
    next(error);
  }
});

betweenSixteenAndNineteenController.post(CITIZEN_DEPENDANTS_EDUCATION_URL, async (req, res, next: NextFunction) => {
  const form = convertToForm(req);
  try {
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const claim = await saveFormToDraftStore(generateRedisKey(<AppRequest>req), form);
      if (hasDisabledChildren(claim)) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CHILDREN_DISABILITY_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});
export default betweenSixteenAndNineteenController;
