import {NextFunction, Response, Router} from 'express';
import {
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

const judgmentAmountSummaryController = Router();
const judgementAmountSummaryViewPath = 'features/claimantResponse/ccj/judgement-amount-summary';

async function renderView(req: AppRequest, res: Response, claim: Claim, lang: string, claimFee: number) {
  const judgmentSummaryDetails = await getJudgmentAmountSummary(claim, claimFee, lang);
  const claimAmountAccepted: number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
  res.render(judgementAmountSummaryViewPath, {
    claimAmount: claimAmountAccepted.toFixed(2),
    claimFee: claimFee.toFixed(2),
    judgmentSummaryDetails,
    pageTitle: 'PAGES.JUDGMENT_AMOUNT.PAGE_TITLE',
  });
}

judgmentAmountSummaryController.get(CCJ_PAID_AMOUNT_SUMMARY_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    await renderView(req, res, claim, lang, claimFee);
  } catch (error) {
    next(error);
  }
});

judgmentAmountSummaryController.post(CCJ_PAID_AMOUNT_SUMMARY_URL, async (req: AppRequest, res: Response) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, CCJ_PAYMENT_OPTIONS_URL));
});

export default judgmentAmountSummaryController;
