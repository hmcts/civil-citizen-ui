import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  GA_PAY_APPLICATION_FEE,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import {
  getCancelUrl,
  saveApplyHelpWithFees,
} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { t } from 'i18next';
import { Claim } from 'models/claim';
import { GenericYesNo } from 'form/models/genericYesNo';
import { YesNo } from 'form/models/yesNo';
import {
  getGaFeePaymentRedirectInformation, getGaFeePaymentStatus
} from 'services/features/generalApplication/generalApplicationFeePaymentService';

const payApplicationFeeController = Router();
const viewPath = 'features/generalApplication/pay-application-fee';
const backLinkUrl = 'test'; // TODO: add url
const success = 'Success';
const failed = 'Failed';
const paymentCancelledByUser = 'Payment was cancelled by the user';

async function renderView(claimId: string, claim: Claim, form: GenericForm<GenericYesNo>, res: Response): Promise<void> {
  const caption = 'PAGES.GENERAL_APPLICATION.PAY_APPLICATION_FEE.APPLICATION_FEE';
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, caption, headingTitle: t('PAGES.GENERAL_APPLICATION.PAY_APPLICATION_FEE.TITLE') });
}

payApplicationFeeController.get(GA_PAY_APPLICATION_FEE, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.applyHelpWithFees));
    await renderView(claimId, claim, form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

payApplicationFeeController.post(GA_PAY_APPLICATION_FEE, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const generalApplicationId = req.params.gaId;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.HELP_WITH_FEES_EMPTY_OPTION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res);
    } else {
      await saveApplyHelpWithFees(redisKey, claim, req.body.option);
      if (claim.generalApplication?.applyHelpWithFees === YesNo.NO) {
        const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
        claim.generalApplication.generalAppPaymentDetails = paymentRedirectInformation;
        const paymentStatus = await getGaFeePaymentStatus(generalApplicationId, paymentRedirectInformation.paymentReference, req);
        paymentRedirectInformation.status = paymentStatus.status;
        paymentRedirectInformation.errorCode = paymentStatus.errorCode;
        paymentRedirectInformation.errorDescription = paymentStatus.errorDescription;
        console.log(paymentStatus);
        if (paymentStatus.status === success) {
          return GA_PAYMENT_SUCCESSFUL_URL;
        } else if (paymentStatus.status === failed && paymentStatus.errorDescription !== paymentCancelledByUser) {
          return GA_PAYMENT_UNSUCCESSFUL_URL;
        }
        return GA_PAY_APPLICATION_FEE;
      } else {
        res.redirect('test'); // TODO: add url
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payApplicationFeeController;
