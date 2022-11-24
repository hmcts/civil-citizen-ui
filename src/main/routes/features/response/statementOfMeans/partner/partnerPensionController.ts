import {NextFunction, Response, Router} from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from '../../../../urls';
import {PartnerPensionService} from 'services/features/response/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';

const citizenPartnerPensionViewPath = 'features/response/statementOfMeans/partner/partner-pension';
const partnerPensionController = Router();
const partnerPensionService = new PartnerPensionService();
const disabilityService = new DisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenPartnerPensionViewPath, {form});
}

partnerPensionController.get(CITIZEN_PARTNER_PENSION_URL, async (req, res, next: NextFunction) => {
  try {
    const partnerPension = await partnerPensionService.getPartnerPension(req.params.id);
    renderView(partnerPension, res);
  } catch (error) {
    next(error);
  }
});

partnerPensionController.post(CITIZEN_PARTNER_PENSION_URL, async (req, res, next: NextFunction) => {
  try {
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await partnerPensionService.savePartnerPension(req.params.id, form);
      const disability = await disabilityService.getDisability(req.params.id);
      (disability.model.option == 'no')
        ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL))
        : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default partnerPensionController;
