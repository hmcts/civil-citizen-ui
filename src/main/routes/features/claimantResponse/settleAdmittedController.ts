import { NextFunction, Request, Response, Router } from 'express';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { getClaimantResponse, saveClaimantResponse } from 'services/features/claimantResponse/claimantResponseService';
import { currencyFormatWithNoTrailingZeros } from 'common/utils/currencyFormat';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { AppRequest } from 'common/models/AppRequest';

const settleAdmittedController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-admitted';

async function renderView(form: GenericForm<GenericYesNo>, claimId: string, res: Response): Promise<void> {
  const claim = await getCaseDataFromStore(claimId);
  const admittedAmount = claim.isFullDefence() ? (claim.isRejectAllOfClaimAlreadyPaid() / 100) : claim.partialAdmissionPaymentAmount();
  res.render(settleClaimViewPath, {
    form,
    totalAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount),
    admittedAmount,
  });
}

settleAdmittedController.get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim = await getCaseDataFromStore(redisKey);
    const claimantResponse = await getClaimantResponse(redisKey);
    const form = claim.isFullDefence() ? new GenericForm(claimantResponse?.hasFullDefenceStatesPaidClaimSettled) : new GenericForm(claimantResponse?.hasPartAdmittedBeenAccepted);
    await renderView(form, redisKey, res);
  } catch (error) {
    next(error);
  }
});

settleAdmittedController.post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(form, redisKey, res);
    } else {
      const claim = await getCaseDataFromStore(redisKey);
      claim.isFullDefence() ?
        await saveClaimantResponse(redisKey, form.model, 'hasFullDefenceStatesPaidClaimSettled') :
        await saveClaimantResponse(redisKey, form.model, 'hasPartAdmittedBeenAccepted');
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default settleAdmittedController;
