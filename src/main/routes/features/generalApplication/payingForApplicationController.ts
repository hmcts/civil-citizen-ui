import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_CHECK_ANSWERS_URL, GA_HEARING_SUPPORT_URL, PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl, getDynamicHeaderForMultipleApplications} from 'services/features/generalApplication/generalApplicationService';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';
import {queryParamNumber} from 'common/utils/requestUtils';

const payingForApplicationController = Router();
const viewPath = 'features/generalApplication/paying-for-application';

payingForApplicationController.get(PAYING_FOR_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const index  = queryParamNumber(req, 'index');
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const headerTitle = getDynamicHeaderForMultipleApplications(claim);
    const gaFeeData = await gaApplicationFeeDetails(claim, req);
    const applicationFee = convertToPoundsFilter(gaFeeData?.calculatedAmountInPence);
    const nextPageUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_CHECK_ANSWERS_URL), index);
    const backLinkUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), index);
    res.render(viewPath, { applicationFee, cancelUrl, backLinkUrl, headerTitle, nextPageUrl});

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payingForApplicationController;
