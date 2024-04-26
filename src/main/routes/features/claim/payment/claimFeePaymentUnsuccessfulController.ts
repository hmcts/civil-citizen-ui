import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL, DASHBOARD_CLAIMANT_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/caseProgression/hearingFee/payment-unsuccessful';

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const makePaymentAgainUrl = constructResponseUrlWithIdParams(claimId, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL);
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const claimNumber : string = claim.getFormattedCaseReferenceNumber(claimId);
    console.log('paymentUnsuccessfulController ------makePaymentAgainUrl---------claim fee--------',makePaymentAgainUrl);
    res.render(paymentUnsuccessfulViewPath, {
      claimNumber,
      makePaymentAgainUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

paymentUnsuccessfulController.post(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentUnsuccessfulController;
