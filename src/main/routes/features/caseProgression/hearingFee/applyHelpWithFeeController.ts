import {RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES, APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {getHearingFeeStartPageContent} from 'services/features/caseProgression/hearingFee/applyHelpWithFeesPageContent';

const applyHelpWithFeeViewPath  = 'features/caseProgression/hearingFee/apply-help-with-fees';
const applyHelpWithFeeController: Router = Router();

async function renderView(res: Response, redirectUrl: string,backLinkUrl:string,claimId:string, totalClaimAmount:number) {

  res.render(applyHelpWithFeeViewPath,
    {
      redirectUrl,
      backLinkUrl,
      applyHelpFeeStartContents:getHearingFeeStartPageContent(claimId,totalClaimAmount),
      pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
      pageTitle: 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE',
    });
}

applyHelpWithFeeController.get(APPLY_HELP_WITH_FEES_START, (async (req, res) => {

  const claimId = req.params.id;
  const redisClaimId = generateRedisKey(<AppRequest>req);
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, APPLY_HELP_WITH_FEES);
  const claim: Claim = await getCaseDataFromStore(redisClaimId);

  await renderView(res, redirectUrl,backLinkUrl,claimId,claim.totalClaimAmount);
}) as RequestHandler);

applyHelpWithFeeController.post(APPLY_HELP_WITH_FEES_START, (async (req, res) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_REFERENCE));
})as RequestHandler);

export default applyHelpWithFeeController;
