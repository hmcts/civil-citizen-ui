import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL, GA_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams, constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {
  getApplicationFromGAService,
  getApplicationIndex,
} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const additionalFeeController = Router();
const viewPath = 'features/generalApplication/additionalFee/additional-fee';

additionalFeeController.get(GA_PAY_ADDITIONAL_FEE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const appId = req.params.appId;
    const claim = await getClaimById(claimId, req, true);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, appId);
    const alreadyPaidPounds = convertToPoundsFilter(applicationResponse?.case_data?.applicationFeeAmountInPence);
    const additionalFeePounds = convertToPoundsFilter(applicationResponse?.case_data?.generalAppPBADetails?.fee?.calculatedAmountInPence);
    const alreadyPaid = currencyFormatWithNoTrailingZeros(alreadyPaidPounds);
    const additionalFee = currencyFormatWithNoTrailingZeros(additionalFeePounds);
    const withNoticeCost = currencyFormatWithNoTrailingZeros(alreadyPaidPounds + additionalFeePounds);
    const urlNextView = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL);
    const index = await getApplicationIndex(claimId, appId, req);
    const backLinkUrl = `${constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_VIEW_APPLICATION_URL)}?index=${index + 1}`;
    res.render(viewPath, {
      withNoticeCost,
      alreadyPaid,
      additionalFee,
      urlNextView,
      backLinkUrl,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default additionalFeeController;
