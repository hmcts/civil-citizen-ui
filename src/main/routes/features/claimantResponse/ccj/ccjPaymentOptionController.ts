import {NextFunction, Request, Response, Router} from 'express';
import {
  CCJ_PAY_BY_SET_DATE_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

const ccjPaymentOptionController = Router();
const ccjPaymentOptionViewPath = 'features/claimantResponse/ccj/ccj-payment-options';
const crPropertyName = 'ccjPaymentOption';
const crParentName = 'ccjRequest';

function renderView(form: GenericForm<CcjPaymentOption>, res: Response): void {
  res.render(ccjPaymentOptionViewPath, { form, PaymentOptionType});
}

ccjPaymentOptionController.get(CCJ_PAYMENT_OPTIONS_URL, async (req, res, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(req.params.id);
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
      await saveClaimantResponse(claimId, ccjPaymentOption.model, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_PAY_BY_SET_DATE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default ccjPaymentOptionController;
