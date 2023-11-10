import {RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, PAY_HEARING_FEE_URL,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const applyHelpWithFeeViewPath  = 'features/caseProgression/hearingFee/apply-help-with-fees';
const applyHelpWithFeeController: Router = Router();

async function renderView(res: Response, redirectUrl: string,backUrl:string) {

  res.render(applyHelpWithFeeViewPath,
    {
      redirectUrl,
      backUrl,
    });
}

applyHelpWithFeeController.get([APPLY_HELP_WITH_FEES], (async (req, res) => {

  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backUrl = constructResponseUrlWithIdParams(req.params.id, PAY_HEARING_FEE_URL);
  await renderView(res, redirectUrl,backUrl);
}) as RequestHandler);

applyHelpWithFeeController.post(APPLY_HELP_WITH_FEES, (async (req, res) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
})as RequestHandler);

export default applyHelpWithFeeController;

