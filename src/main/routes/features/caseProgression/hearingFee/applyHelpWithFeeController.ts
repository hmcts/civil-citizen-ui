import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const applyHelpWithFeeViewPath  = 'features/caseProgression/hearingFee/apply-help-with-fees';
const applyHelpWithFeeController: Router = Router();

async function renderView(res: Response, redirectUrl: string) {

  res.render(applyHelpWithFeeViewPath,
    {
      redirectUrl,
    });
}

applyHelpWithFeeController.get([APPLY_HELP_WITH_FEES], (async (req, res, next: NextFunction) => {

  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  await renderView(res, redirectUrl);
}) as RequestHandler);

applyHelpWithFeeController.post(APPLY_HELP_WITH_FEES, (async (req:any, res) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
})as RequestHandler);

export default applyHelpWithFeeController;

