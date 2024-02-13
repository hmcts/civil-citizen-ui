import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CCJ_EXTENDED_PAID_AMOUNT_URL,
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAID_AMOUNT_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';

const paidAmountController = Router();
const paidAmountViewPath = 'features/claimantResponse/ccj/paid-amount';
const crPropertyName = 'paidAmount';
const crParentName = 'ccjRequest';
export const urlFromTaskList = 'county-court-judgement';
function renderView(form: GenericForm<PaidAmount>, res: Response): void {
  res.render(paidAmountViewPath, {form});
}

paidAmountController.get([CCJ_PAID_AMOUNT_URL, CCJ_EXTENDED_PAID_AMOUNT_URL], async (req, res, next: NextFunction) => {
  try {
    await getClaimById(req.params.id, req, true);
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    const paidAmount = claimantResponse.ccjRequest?.paidAmount ?
      claimantResponse.ccjRequest.paidAmount : new PaidAmount();
    renderView(new GenericForm(paidAmount), res);
  } catch (error) {
    next(error);
  }
});

paidAmountController.post([CCJ_PAID_AMOUNT_URL, CCJ_EXTENDED_PAID_AMOUNT_URL], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim = await getCaseDataFromStore(redisKey);
    const claimedAmount: number = claim.hasClaimantSettleTheClaimForDefendantPartlyPaidAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
    const paidAmount = new GenericForm(new PaidAmount(req.body.option, (Number(req.body.amount)), claimedAmount));
    let redirectURL: string = CCJ_PAID_AMOUNT_SUMMARY_URL;
    if (req.url.includes(urlFromTaskList)) {
      redirectURL = CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL;
    }
    paidAmount.validateSync();
    if (paidAmount.hasErrors()) {
      renderView(paidAmount, res);
    } else {
      await saveClaimantResponse(redisKey, paidAmount.model, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectURL));
    }
  } catch (error) {
    next(error);
  }
});

export default paidAmountController;
