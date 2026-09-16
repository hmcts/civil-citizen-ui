import {NextFunction, RequestHandler, Response, Request, Router} from 'express';
import {CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL, DASHBOARD_CLAIMANT_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';

const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/caseProgression/hearingFee/payment-unsuccessful';

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req as Request, 'id');
    const makePaymentAgainUrl = constructResponseUrlWithIdParams(claimId, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL);
    const draftResult = await getDraftClaim(req);
    const claim: Claim = Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
    const claimNumber : string = claim.getFormattedCaseReferenceNumber(claimId);
    res.render(paymentUnsuccessfulViewPath, {
      claimNumber,
      makePaymentAgainUrl,
      pageTitle: 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.UNSUCCESSFUL.PAGE_TITLE',
      noCrumbs: true,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

paymentUnsuccessfulController.post(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(getRouteParam(req as Request, 'id'), DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentUnsuccessfulController;
