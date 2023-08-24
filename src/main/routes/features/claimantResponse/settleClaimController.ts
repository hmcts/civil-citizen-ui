import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL ,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {saveClaimantResponse} from '../../../services/features/claimantResponse/claimantResponseService';
import {YesNo} from '../../../common/form/models/yesNo';
import {convertToPoundsFilter} from "common/utils/currencyFormat";

const settleClaimController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-claim';

function renderView(form: GenericForm<GenericYesNo>, res: Response, paidAmount: number): void {
  res.render(settleClaimViewPath, {form, paidAmount});
}

let paidAmount: number;

settleClaimController.get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    const amount = convertToPoundsFilter(1000);
    renderView(new GenericForm(claim.claimantResponse?.hasPartPaymentBeenAccepted), res, amount);
  } catch (error) {
    next(error);
  }
});

settleClaimController.post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res, paidAmount);
    } else {
      await saveClaimantResponse(claimId, form.model, 'hasPartPaymentBeenAccepted');
      if (form.model.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL ));
      }
    }
  } catch (error) {
    next(error);
  }

});

export default settleClaimController;
