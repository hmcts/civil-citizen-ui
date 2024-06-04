import {RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES, APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
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

applyHelpWithFeeController.get(APPLY_HELP_WITH_FEES_START, (async (req, res) => {

  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backUrl = constructResponseUrlWithIdParams(req.params.id, APPLY_HELP_WITH_FEES);
  await renderView(res, redirectUrl,backUrl);
}) as RequestHandler);

applyHelpWithFeeController.post(APPLY_HELP_WITH_FEES_START, (async (req, res) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_REFERENCE));
})as RequestHandler);

export default applyHelpWithFeeController;
