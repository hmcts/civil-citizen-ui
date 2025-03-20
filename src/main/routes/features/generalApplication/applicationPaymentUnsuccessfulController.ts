import {NextFunction, Response, Router} from 'express';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL, GA_PAYMENT_UNSUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_COSC_URL} from 'routes/urls';
import {
  getApplicationFromGAService,
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';

const applicationPaymentUnsuccessfulViewPath = 'features/generalApplication/application-payment-unsuccessful';
const applicationPaymentUnsuccessfulController: Router = Router();

applicationPaymentUnsuccessfulController.get([GA_PAYMENT_UNSUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_COSC_URL], (req: AppRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const claimId = req.params.id;
      const appId = req.params.appId;
      const claim = await getClaimById(claimId, req, true);
      const applicationResponse = await getApplicationFromGAService(req, appId);
      const isAdditionalFee = !!applicationResponse?.case_data?.generalAppPBADetails?.additionalPaymentServiceRef;
      const cancelUrl = await getCancelUrl(claimId, claim);
      const makePaymentAgainUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, isAdditionalFee
        ? GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL : GA_APPLY_HELP_WITH_FEE_SELECTION);
      res.render(applicationPaymentUnsuccessfulViewPath, {cancelUrl, makePaymentAgainUrl, noCrumbs: true,
        pageTitle: 'PAGES.GENERAL_APPLICATION.PAYMENT_UNSUCCESSFUL.TITLE'});
    } catch (error) {
      next(error);
    }
  })();
});

export default applicationPaymentUnsuccessfulController;
