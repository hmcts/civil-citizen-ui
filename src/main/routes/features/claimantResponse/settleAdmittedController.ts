import { NextFunction, Request, Response, Router } from 'express';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimantResponse, saveClaimantResponse } from 'services/features/claimantResponse/claimantResponseService';
import {
  currencyFormatWithNoTrailingZeros,
  noGroupingCurrencyFormatWithNoTrailingZeros,
} from 'common/utils/currencyFormat';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { AppRequest } from 'common/models/AppRequest';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';

const settleAdmittedController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-admitted';

async function renderView(form: GenericForm<GenericYesNo>, claim:Claim, res: Response): Promise<void> {

  const admittedAmount = noGroupingCurrencyFormatWithNoTrailingZeros(
    claim.isFullDefence() ? (claim.isRejectAllOfClaimAlreadyPaid() / 100) : claim.partialAdmissionPaymentAmount());
  res.render(settleClaimViewPath, {
    form,
    totalAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount),
    admittedAmount,
    pageTitle: t('PAGES.PARTIAL_ADMISSION_SETTLE_ADMITTED.PAGE_TITLE', {admittedAmount: admittedAmount}),
  });
}

settleAdmittedController.get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const claimantResponse = await getClaimantResponse(generateRedisKey(<AppRequest>req));
    const form = claim.isFullDefence() ? new GenericForm(claimantResponse?.hasFullDefenceStatesPaidClaimSettled) : new GenericForm(claimantResponse?.hasPartAdmittedBeenAccepted);
    await renderView(form,claim, res);
  } catch (error) {
    next(error);
  }
});

settleAdmittedController.post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(form,claim, res);
    } else {
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
