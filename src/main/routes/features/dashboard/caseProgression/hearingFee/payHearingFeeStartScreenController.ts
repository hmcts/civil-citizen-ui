import {NextFunction, RequestHandler, Router} from 'express';
import {CP_PAY_HEARING_FEE_START_URL} from 'routes/urls';
import {
  getPayHearingFeeStartScreenContent,
} from 'services/features/dashboard/caseProgression/hearingFee/payHearingFeeStartScreenContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const payHearingFeeStartScreenViewPath = 'features/dashboard/caseProgression/hearingFee/pay-hearing-fee-start';
const payHearingFeeStartScreenController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

payHearingFeeStartScreenController.get(CP_PAY_HEARING_FEE_START_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(payHearingFeeStartScreenViewPath, {payHearingFeeStartScreenContent:getPayHearingFeeStartScreenContent(claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payHearingFeeStartScreenController;
