import {NextFunction, Response, Router} from 'express';
import {CITIZEN_ALREADY_PAID_URL, RESPONSE_TASK_LIST_URL} from '../../../../urls';
import {
  PartialAdmissionService,
} from '../../../../../services/features/response/admission/partialAdmission/partialAdmissionService';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const alreadyPaidController = Router();
const citizenAlreadyPaidViewPath = 'features/response/admission/partialAdmission/already-paid';
const partialAdmissionService = new PartialAdmissionService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenAlreadyPaidViewPath, {form});
}

alreadyPaidController.get(CITIZEN_ALREADY_PAID_URL, async (req, res, next: NextFunction) => {
  try {
    const alreadyPaidForm = new GenericForm(new GenericYesNo(await partialAdmissionService.getClaimAlreadyPaid(generateRedisKey(<AppRequest>req))));
    renderView(alreadyPaidForm, res);
  } catch (error) {
    next(error);
  }
});

alreadyPaidController.post(CITIZEN_ALREADY_PAID_URL, async (req, res, next: NextFunction) => {
  try {
    const alreadyPaidForm = new GenericForm(new GenericYesNo(req.body.option));
    await alreadyPaidForm.validate();

    if (alreadyPaidForm.hasErrors()) {
      renderView(alreadyPaidForm, res);
    } else {
      await partialAdmissionService.saveClaimAlreadyPaid(generateRedisKey(<AppRequest>req), alreadyPaidForm.model.option);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default alreadyPaidController;
