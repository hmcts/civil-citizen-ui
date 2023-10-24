import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {
  getGenericOptionForm,
} from 'services/genericForm/genericFormService';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {ClaimantResponseErrorMessages} from 'form/models/claimantResponse/claimantResponseErrorMessages';
import { AppRequest } from 'common/models/AppRequest';

const partPaymentReceivedController = Router();
const partPaymentReceivedViewPath = 'features/claimantResponse/part-payment-received';
const claimantResponsePropertyName = 'hasDefendantPaidYou';

function renderView(form: GenericForm<GenericYesNo>, res: Response, paidAmount: number): void {
  res.render(partPaymentReceivedViewPath, {form, paidAmount});
}

let paidAmount: number;

partPaymentReceivedController.get(CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL, async (req, res, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const claimantResponse = claim?.claimantResponse ? claim.claimantResponse : new ClaimantResponse();
    paidAmount = claim.getPaidAmount();
    renderView(new GenericForm(claimantResponse.hasDefendantPaidYou), res, paidAmount);
  } catch (error) {
    next(error);
  }
});

partPaymentReceivedController.post(CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const genericYesNoForm =  new GenericForm(getGenericOptionForm(req.body.option, claimantResponsePropertyName, ClaimantResponseErrorMessages));
    genericYesNoForm.validateSync();

    if (genericYesNoForm.hasErrors()) {
      renderView(genericYesNoForm, res, paidAmount);
    } else {
      await saveClaimantResponse(generateRedisKey(<AppRequest>req), genericYesNoForm.model, claimantResponsePropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default partPaymentReceivedController;
