import {NextFunction, RequestHandler, Router} from 'express';
import {PAY_HEARING_FEE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/hearingFeeStartPageContent';

const payHearingFeeStartScreenViewPath = 'features/caseProgression/hearingFee/pay-hearing-fee-start';
const payHearingFeeStartScreenController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

payHearingFeeStartScreenController.get(PAY_HEARING_FEE_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(payHearingFeeStartScreenViewPath, {payHearingFeeStartScreenContent: getHearingFeeStartPageContent(claimId, lang, claim.caseProgressionHearing.hearingFeeInformation)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payHearingFeeStartScreenController;
