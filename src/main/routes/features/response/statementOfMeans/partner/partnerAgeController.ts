import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from 'routes/urls';
import {PartnerAgeService} from 'services/features/response/statementOfMeans/partner/partnerAgeService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const citizenPartnerAgeViewPath = 'features/response/statementOfMeans/partner/partner-age';
const partnerAgeController = Router();
const partnerAgeService = new PartnerAgeService();
const disabilityService = new DisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenPartnerAgeViewPath, {form});
}

partnerAgeController.get(CITIZEN_PARTNER_AGE_URL, (async (req, res, next: NextFunction) => {
  try {
    const partnerAge = await partnerAgeService.getPartnerAge(<AppRequest>req);
    renderView(partnerAge, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

partnerAgeController.post(CITIZEN_PARTNER_AGE_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const caseId = getRouteParam(req, 'id');
      const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await partnerAgeService.savePartnerAge(<AppRequest>req, form);
        if (form.model.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_PARTNER_PENSION_URL));
        } else {
          const disability = await disabilityService.getDisability(<AppRequest>req);
          disability.model.option == 'yes'
            ? res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_PARTNER_DISABILITY_URL))
            : res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_DEPENDANTS_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default partnerAgeController;
