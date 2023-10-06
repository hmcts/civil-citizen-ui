import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CCJ_EXTENDED_PAID_AMOUNT_URL,
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAID_AMOUNT_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from '../../../../services/features/claimantResponse/claimantResponseService';
import {PaidAmount} from '../../../../common/models/claimantResponse/ccj/paidAmount';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';

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
    const claimantResponse = await getClaimantResponse(req.params.id);
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
    const claim = await getCaseDataFromStore(claimId);
    const claimedAmount = claim.totalClaimAmount;
    const paidAmount = new GenericForm(new PaidAmount(req.body.option, (Number(req.body.amount)), claimedAmount));
    let redirectURL: string = CCJ_PAID_AMOUNT_SUMMARY_URL;
    if (req.url.includes(urlFromTaskList)) {
      redirectURL = CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL;
    }
    paidAmount.validateSync();
    if (paidAmount.hasErrors()) {
      renderView(paidAmount, res);
    } else {
      await saveClaimantResponse(claimId, paidAmount.model, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectURL));
    }
  } catch (error) {
    next(error);
  }
});

export default paidAmountController;
