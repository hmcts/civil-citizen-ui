import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
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
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

const settleClaimController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-claim';
const claimantResponsePropertyName = 'hasPartPaymentBeenAccepted';

function renderView(form: GenericForm<GenericYesNo>, res: Response, paidAmount: number, isPaidInFull: boolean): void {
  res.render(settleClaimViewPath, {form, paidAmount, isPaidInFull});
}

let paidAmount: number;
let hasPaidInFull: boolean;

settleClaimController.get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  const claimId = req.params.id;
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isFullDefence()) {
      paidAmount = convertToPoundsFilter(claim.isRejectAllOfClaimAlreadyPaid());
      hasPaidInFull = claim.hasPaidInFull();
    } else {
      paidAmount = convertToPoundsFilter(claim.isRejectAllOfClaimAlreadyPaid());
    }
    renderView(new GenericForm(claim.claimantResponse?.hasPartPaymentBeenAccepted), res, paidAmount, hasPaidInFull);
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
      renderView(form, res, paidAmount, null);
    } else {
      await saveClaimantResponse(claimId, form.model, claimantResponsePropertyName);
      const redirectionLink = form.model.option === YesNo.YES ? CLAIMANT_RESPONSE_TASK_LIST_URL : CLAIMANT_RESPONSE_REJECTION_REASON_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectionLink));
    }
  } catch (error) {
    next(error);
  }

});

export default settleClaimController;
