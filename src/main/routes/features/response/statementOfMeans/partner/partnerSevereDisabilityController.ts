import {NextFunction, Response, Router} from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL} from '../../../../urls';
import {PartnerSevereDisabilityService} from '../../../../../services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-severe-disability';
const partnerSevereDisabilityController = Router();
const partnerSevereDisabilityService = new PartnerSevereDisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(partnerViewPath, {form});
}

partnerSevereDisabilityController.get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL, async (req, res, next: NextFunction) => {
  try {
    const partnerSevereDisability = await partnerSevereDisabilityService.getPartnerSevereDisability(generateRedisKey(<AppRequest>req));
    renderView(partnerSevereDisability, res);
  } catch (error) {
    next(error);
  }
});

partnerSevereDisabilityController.post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
  async (req, res, next: NextFunction) => {
    try {
      const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await partnerSevereDisabilityService.savePartnerSevereDisability(generateRedisKey(<AppRequest>req), form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default partnerSevereDisabilityController;
