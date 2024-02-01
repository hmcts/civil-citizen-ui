import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_AGE_URL, CITIZEN_PARTNER_URL} from 'routes/urls';
import {CohabitingService} from 'services/features/response/statementOfMeans/partner/cohabitingService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner';
const partnerController = Router();
const cohabitingService = new CohabitingService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(partnerViewPath, {form});
}

partnerController.get(CITIZEN_PARTNER_URL, (async (req, res, next: NextFunction) => {
  try {
    const cohabiting = await cohabitingService.getCohabiting(generateRedisKey(<AppRequest>req));
    renderView(cohabiting, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

partnerController.post(CITIZEN_PARTNER_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await cohabitingService.saveCohabiting(generateRedisKey(<AppRequest>req), form);
        form.model.option == 'yes'
          ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_AGE_URL))
          : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default partnerController;
