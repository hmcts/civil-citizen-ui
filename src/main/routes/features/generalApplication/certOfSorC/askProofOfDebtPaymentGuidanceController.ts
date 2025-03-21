import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL, COSC_FINAL_PAYMENT_DATE_URL,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {gaApplicationFeeDetails} from 'services/features/generalApplication/feeDetailsService';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';

const askProofOfDebtPaymentGuidanceController = Router();
const viewPath = 'features/generalApplication/certOfSorC/ask-proof-debtPayment-guidance';

askProofOfDebtPaymentGuidanceController.get(GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    let backLinkUrl = BACK_URL;
    if(claim.generalApplication == null) {
      claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
      const applicationType = new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
      claim.generalApplication?.applicationTypes.push(applicationType);
      backLinkUrl = cancelUrl;
    }
    const gaFeeData = await gaApplicationFeeDetails(claim, req);
    const applicationFee = convertToPoundsFilter(gaFeeData?.calculatedAmountInPence.toString());
    const nextPageUrl = constructResponseUrlWithIdParams(req.params.id, COSC_FINAL_PAYMENT_DATE_URL);

    res.render(viewPath, { cancelUrl, backLinkUrl, nextPageUrl, applicationFee});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default askProofOfDebtPaymentGuidanceController;
