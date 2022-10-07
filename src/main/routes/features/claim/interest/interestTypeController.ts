import express from 'express';
import {
  CITIZEN_PA_PAYMENT_DATE_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import InterestClaimOptions from "common/form/models/claim/interest/interestClaimOptions";
import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";

const interestTypeController = express.Router();
const interestTypeViewPath = 'features/claim/interest-type';


function renderView(form: GenericForm<InterestClaimOptions>, res: express.Response) {
  res.render(interestTypeViewPath, {form});
}

interestTypeController.get(CLAIM_INTEREST_TYPE_URL, async (req: AppRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const interestType = await getInterestTypeForm(claimId);
    renderView(new GenericForm(interestType), res);
  } catch (error) {
    next(error);
  }
});

interestTypeController.post(CLAIM_INTEREST_TYPE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const interestType = new GenericForm(new InterestClaimOptions(req.body.interestType));
    interestType.validateSync();

    if (interestType.hasErrors()) {
      renderView(interestType, res);
    } else {
      await saveInterestTypeOption(claimId, interestType.model.interestType);
      if (form.paymentOptionBySetDateSelected()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default interestTypeController;
