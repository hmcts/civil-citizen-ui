import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {YesNo} from 'form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { getClaimSettled, getPaidAmount } from 'services/features/claimantResponse/settleClaimService';

const settleClaimController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-claim';
const claimantResponsePropertyName = 'hasPartPaymentBeenAccepted';
const claimantResponseFulladmitStatesPaid = 'hasFullDefenceStatesPaidClaimSettled';

function renderView(form: GenericForm<GenericYesNo>, res: Response, paidAmount: number, isPaidInFull: boolean): void {
  res.render(settleClaimViewPath, {form, paidAmount, isPaidInFull});
}

let paidAmount: number;

settleClaimController.get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: AppRequest, res, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(generateRedisKey(req));
    renderView(new GenericForm(getClaimSettled(claim)), res, getPaidAmount(claim), claim.hasPaidInFull());
  } catch (error) {
    next(error);
  }
});

settleClaimController.post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res, paidAmount, null);
    } else {
      claim.isFullDefence() && claim.hasPaidInFull() ?
        await saveClaimantResponse(redisKey, form.model, claimantResponseFulladmitStatesPaid) :
        await saveClaimantResponse(redisKey, form.model, claimantResponsePropertyName);
      const redirectionLink = form.model.option === YesNo.YES ? CLAIMANT_RESPONSE_TASK_LIST_URL : CLAIMANT_RESPONSE_REJECTION_REASON_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectionLink));
    }
  } catch (error) {
    next(error);
  }

});

export default settleClaimController;
