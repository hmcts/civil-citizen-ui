import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DASHBOARD_CLAIMANT_URL, PAY_HEARING_FEE_SUCCESSFUL_URL,
} from 'routes/urls';
import {
  getPaymentSuccessfulBodyContent, getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/paymentSuccessfulContents';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
const paymentSuccessfulController: Router = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const paymentSuccessfulViewPath  = 'features/claim/payment-successful';

async function renderView(res: Response, req:  AppRequest | Request, claimId: string, redirectUrl: string, calculatedAmountInPence: string) {
  const claim: Claim = await getClaimById(claimId, req, true);
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(paymentSuccessfulViewPath,
    {
      paymentSuccessfulPanel: getPaymentSuccessfulPanelContent(claim,lng),
      paymentSuccessfulBody: getPaymentSuccessfulBodyContent(claim, calculatedAmountInPence,lng),
      paymentSuccessfulButton: getPaymentSuccessfulButtonContent(redirectUrl),
      pageTitle: 'PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.TITLE',
      noCrumbs: true,
    });
}

paymentSuccessfulController.get(PAY_HEARING_FEE_SUCCESSFUL_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    const ccdClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const calculatedAmountInPence = ccdClaim.caseProgressionHearing?.hearingFeeInformation?.hearingFee?.calculatedAmountInPence;
    await renderView(res, req, claimId, redirectUrl, calculatedAmountInPence);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentSuccessfulController;
