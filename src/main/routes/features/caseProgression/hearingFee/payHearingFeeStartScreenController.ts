import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  PAY_HEARING_FEE_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/hearingFeeStartPageContent';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseRole} from 'form/models/caseRoles';

const payHearingFeeStartScreenViewPath = 'features/caseProgression/hearingFee/pay-hearing-fee-start';
const payHearingFeeStartScreenController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

payHearingFeeStartScreenController.get(PAY_HEARING_FEE_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const dashboardUrl = claim.caseRole === CaseRole.CLAIMANT ? constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL) : constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    res.render(payHearingFeeStartScreenViewPath, {
      payHearingFeeStartScreenContent: getHearingFeeStartPageContent(claimId, lang,claim.totalClaimAmount, claim.caseProgressionHearing.hearingFeeInformation),
      homeUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      dashboardUrl,
    });
  } catch (error) {
    const claimRetrievalError = error as { response?: { status?: number }, status?: number };
    if (claimRetrievalError?.response?.status === 404) {
      claimRetrievalError.status = 500;
    }
    next(claimRetrievalError);
  }
}) as RequestHandler);

export default payHearingFeeStartScreenController;
