import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_PAY_APPLICATION_FEE } from 'routes/urls';
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
import { getFeePaymentRedirectInformation } from 'services/features/feePayment/feePaymentService';
import { FeeType } from 'form/models/helpWithFees/feeType';
import { YesNo } from 'form/models/yesNo';

const payApplicationFeeController = Router();
const viewPath = 'features/generalApplication/pay-application-fee';
const backLinkUrl = 'test'; // TODO: add url

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
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.HELP_WITH_FEES_EMPTY_OPTION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res);
    } else {
      await saveApplyHelpWithFees(redisKey, claim, req.body.option);
      if (claim.generalApplication?.applyHelpWithFees === YesNo.NO) {
        const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.GENERALAPPLICATION, req);
        res.redirect(paymentRedirectInformation?.nextUrl);
      } else {
        res.redirect('test'); // TODO: add url
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payApplicationFeeController;
