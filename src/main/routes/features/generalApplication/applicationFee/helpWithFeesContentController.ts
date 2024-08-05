import {RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  GA_APPLY_HELP_WITH_FEES,
  GA_APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getApplicationFeeContentPageDetails} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';

const applyHelpWithFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-content';
const helpWithFeesContentController: Router = Router();

helpWithFeesContentController.get(GA_APPLY_HELP_WITH_FEES_START, (async (req: AppRequest, res: Response) => {
  const claimId = req.params.id;
  const isAdditionalFeeType = req.query.additionalFeeTypeFlag === 'true';
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEES);
  res.render(applyHelpWithFeeViewPath,
    {
      backLinkUrl,
      redirectUrl,
      applyHelpWithFeeContents:getApplicationFeeContentPageDetails(claimId, isAdditionalFeeType),
    });
}) as RequestHandler);

export default helpWithFeesContentController;
