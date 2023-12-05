import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_PAYMENT_OPTIONS_URL,
  CCJ_DEFENDANT_PAYMENT_DATE_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL, CCJ_CHECK_AND_SEND_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';

const ccjPaymentOptionController = Router();
const ccjPaymentOptionViewPath = 'features/claimantResponse/ccj/ccj-payment-options';
const crPropertyName = 'ccjPaymentOption';
const crParentName = 'ccjRequest';

function renderView(form: GenericForm<CcjPaymentOption>, res: Response): void {
  res.render(ccjPaymentOptionViewPath, {form});
}

ccjPaymentOptionController.get(CCJ_PAYMENT_OPTIONS_URL, async (req, res, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm(new CcjPaymentOption(claimantResponse.ccjRequest?.ccjPaymentOption?.type)), res);
  } catch (error) {
    next(error);
  }
});

ccjPaymentOptionController.post(CCJ_PAYMENT_OPTIONS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const ccjPaymentOption = new GenericForm(new CcjPaymentOption(req.body.type));
    ccjPaymentOption.validateSync();
    if (ccjPaymentOption.hasErrors()) {
      renderView(ccjPaymentOption, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), ccjPaymentOption.model, crPropertyName, crParentName);
      if (ccjPaymentOption.model.isCcjPaymentOptionBySetDate()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_DEFENDANT_PAYMENT_DATE_URL));
      } else if (ccjPaymentOption.model.isCcjPaymentOptionInstalments()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_REPAYMENT_PLAN_INSTALMENTS_URL));
      } else if(ccjPaymentOption.model.isCcjPaymentOptionImmediately()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default ccjPaymentOptionController;
