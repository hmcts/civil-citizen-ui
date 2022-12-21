import {NextFunction, Response, Router} from 'express';
import {CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL, CCJ_PAID_AMOUNT_SUMMARY_URL} from '../../../urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {Claim} from 'models/claim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';

const judgmentAmountSummaryController = Router();
const judgementAmountSummaryViewPath = 'features/claimantResponse/ccj/judgement-amount-summary';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(req: AppRequest, res: Response, claim: Claim, lang: string) {
  const claimFee = await civilServiceClient.getClaimAmountFee(claim?.totalClaimAmount, req);
  const judgmentSummaryDetails = getJudgmentAmountSummary(claim, claimFee, lang, req.url);
  res.render(judgementAmountSummaryViewPath, {
    claimAmount: claim.totalClaimAmount,
    claimFee,
    judgmentSummaryDetails,
  });
}

judgmentAmountSummaryController.get([CCJ_PAID_AMOUNT_SUMMARY_URL,CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL], async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(req.params.id);
    await renderView(req, res, claim, lang);
  } catch (error) {
    next(error);
  }
});

export default judgmentAmountSummaryController;
