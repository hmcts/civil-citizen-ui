import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_OTHER_DEPENDANTS_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_CARER_URL,
} from 'routes/urls';
import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';
import {OtherDependantsService} from 'services/features/response/statementOfMeans/otherDependants/otherDependantsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';

const citizenOtherDependantsViewPath = 'features/response/statementOfMeans/otherDependants/other-dependants';
const otherDependantsController = Router();
const otherDependantsService = new OtherDependantsService();

function renderView(form: GenericForm<OtherDependants>, res: Response): void {
  res.render(citizenOtherDependantsViewPath, {form});
}

otherDependantsController.get(CITIZEN_OTHER_DEPENDANTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const response = await otherDependantsService.getOtherDependants(generateRedisKey(<AppRequest>req));
    const otherDependants = response
      ? new GenericForm(new OtherDependants(response.option, response.numberOfPeople, response.details))
      : new GenericForm(new OtherDependants());
    renderView(otherDependants, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

otherDependantsController.post(CITIZEN_OTHER_DEPENDANTS_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const form: GenericForm<OtherDependants> = new GenericForm(new OtherDependants(
        req.body.option, req.body.numberOfPeople, req.body.details));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await otherDependantsService.saveOtherDependants(redisKey, form);
        const claim: Claim = await getCaseDataFromStore(redisKey);
        if (claim.isDefendantSeverelyDisabledOrDependentsDisabled()) {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_CARER_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default otherDependantsController;
