import {NextFunction, Response, Router} from 'express';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAID_AMOUNT_SUMMARY_URL, CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {Claim} from 'models/claim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const judgmentAmountSummaryController = Router();
const judgementAmountSummaryViewPath = 'features/claimantResponse/ccj/judgement-amount-summary';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(req: AppRequest, res: Response, claim: Claim, lang: string, claimFee: number) {
  const judgmentSummaryDetails = getJudgmentAmountSummary(claim, claimFee, lang);
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
    const claimFee = await civilServiceClient.getClaimAmountFee(claim?.totalClaimAmount, req);
    renderView(req, res, claim, lang, claimFee);
  } catch (error) {
    next(error);
  }
});

judgmentAmountSummaryController.post([CCJ_PAID_AMOUNT_SUMMARY_URL,CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL], async (req: AppRequest, res: Response, next: NextFunction) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, CCJ_PAYMENT_OPTIONS_URL));
});

export default judgmentAmountSummaryController;
