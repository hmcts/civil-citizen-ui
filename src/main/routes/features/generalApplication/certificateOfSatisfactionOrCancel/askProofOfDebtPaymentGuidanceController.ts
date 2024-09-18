import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const askProofOfDebtPaymentGuidanceController = Router();
const viewPath = 'features/generalApplication/certificateOfSatisfactionOrCancel/ask-proof-debtPayment-guidance';

askProofOfDebtPaymentGuidanceController.get(GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, APPLICATION_TYPE_URL);
    const nextPageUrl = 'test';
    res.render(viewPath, { cancelUrl, backLinkUrl, nextPageUrl});

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default askProofOfDebtPaymentGuidanceController;
