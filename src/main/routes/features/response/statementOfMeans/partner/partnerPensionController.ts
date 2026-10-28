import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from '../../../../urls';
import {PartnerPensionService} from 'services/features/response/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const citizenPartnerPensionViewPath = 'features/response/statementOfMeans/partner/partner-pension';
const partnerPensionController = Router();
const partnerPensionService = new PartnerPensionService();
const disabilityService = new DisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenPartnerPensionViewPath, {form});
}

partnerPensionController.get(CITIZEN_PARTNER_PENSION_URL, (async (req, res, next: NextFunction) => {
  try {
    const partnerPension = await partnerPensionService.getPartnerPension(<AppRequest>req);
    renderView(partnerPension, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

partnerPensionController.post(CITIZEN_PARTNER_PENSION_URL, (async (req, res, next: NextFunction) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await partnerPensionService.savePartnerPension(<AppRequest>req, form);
      const disability = await disabilityService.getDisability(<AppRequest>req);
      (disability.model.option == 'no')
        ? res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_DEPENDANTS_URL))
        : res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_PARTNER_DISABILITY_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default partnerPensionController;
