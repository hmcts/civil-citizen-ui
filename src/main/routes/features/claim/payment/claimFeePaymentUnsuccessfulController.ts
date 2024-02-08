import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/caseProgression/hearingFee/payment-unsuccessful';

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const paymentRedirectNextUrl = paymentRedirectInformation.nextUrl;
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const claimNumber : string = claim.getFormattedCaseReferenceNumber(claimId);
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    res.render(paymentUnsuccessfulViewPath, {
      claimNumber,
      paymentRedirectNextUrl,
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
