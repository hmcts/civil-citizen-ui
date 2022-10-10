import express from 'express';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_TOTAL_URL,
  CLAIM_INTEREST_TYPE_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import InterestClaimOption from "../../../../common/form/models/claim/interest/interestClaimOption";
import {constructResponseUrlWithIdParams} from "../../../../common/utils/urlFormatter";
import {
  getInterestTypeForm,
  saveInterestTypeOption,
} from "../../../../services/features/claim/interest/interestTypeService";
import {InterestClaimOptionsType} from '../../../../common/form/models/claim/interest/interestClaimOptionsType';

const interestTypeController = express.Router();
const interestTypeViewPath = 'features/claim/interest/interest-type';


function renderView(form: GenericForm<InterestClaimOption>, res: express.Response) {
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

interestTypeController.post(CLAIM_INTEREST_TYPE_URL, async (req: AppRequest | express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session?.user?.id;
    const interestTypeForm = new GenericForm(new InterestClaimOption(req.body.interestType));
    interestTypeForm.validateSync();

    if (interestTypeForm.hasErrors()) {
      renderView(interestTypeForm, res);
    } else {
      await saveInterestTypeOption(claimId, interestTypeForm.model);
      if (interestTypeForm.model.interestType == InterestClaimOptionsType.SAME_RATE_INTEREST) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_INTEREST_RATE_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_INTEREST_TOTAL_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default interestTypeController;
