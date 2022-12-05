import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {Claim} from 'common/models/claim';

import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const settleAdmittedController = Router();
const settleClaimViewPath = 'features/claimantResponse/settle-admitted';

async function renderView(form: GenericForm<GenericYesNo>, claimId: string, res: Response): Promise<void> {
  const claim = await getCaseDataFromStore(claimId);
  res.render(settleClaimViewPath, {
    form,
    totalAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount),
    admittedAmount: claim.partialAdmissionPaymentAmount(),
  });
}

settleAdmittedController.get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {  const claimId = req.params.id;
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    await renderView(new GenericForm(claim.claimantResponse?.hasPartAdmittedBeenAccepted), claimId, res);
  } catch (error) {
    next(error);
  }
});

settleAdmittedController.post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, async (req: Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(form, claimId, res);
    } else {
      await saveClaimantResponse(claimId, form.model, 'hasPartAdmittedBeenAccepted');
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }

});

export default settleAdmittedController;
