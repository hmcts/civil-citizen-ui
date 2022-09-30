import * as express from 'express';
import {ClaimantPhoneNumber} from '../../../../common/form/models/claim/claimantPhoneNumber';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getClaimantPhone,saveClaimantPhone} from '../../../../../main/services/features/claim/claimantPhoneService';
import {AppRequest} from '../../../../common/models/AppRequest';

const claimantPhoneViewPath = 'features/public/claim/claimant-phone';
const claimantPhoneController = express.Router();

function renderView(form: GenericForm<ClaimantPhoneNumber>, res: express.Response): void {
  res.render(claimantPhoneViewPath, {form});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = getUserId();
    const form: ClaimantPhoneNumber = await getClaimantPhone(claimId);
    renderView(new GenericForm<ClaimantPhoneNumber>(form),res);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = getUserId();
    const form: GenericForm<ClaimantPhoneNumber> = new GenericForm(new ClaimantPhoneNumber(req.body.phoneNumber));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimantPhone(claimId,form.model);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

const getUserId = (): string => {
  let req: AppRequest;
  return req.session.user.id;
};

export default claimantPhoneController;
