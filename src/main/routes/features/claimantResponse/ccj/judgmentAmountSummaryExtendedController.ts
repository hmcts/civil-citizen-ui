import {NextFunction, Response, Router} from 'express';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {ChooseHowToProceed} from 'common/form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';

const judgmentAmountSummaryExtendedController = Router();
const judgementAmountSummaryViewPath = 'features/claimantResponse/ccj/judgement-amount-summary';

function renderView(req: AppRequest, res: Response, claim: Claim, lang: string, claimFee: number) {
  const judgmentSummaryDetails = getJudgmentAmountSummary(claim, claimFee, lang);
  res.render(judgementAmountSummaryViewPath, {
    claimAmount: claim.totalClaimAmount,
    claimFee,
    judgmentSummaryDetails,
  });
}

judgmentAmountSummaryExtendedController.get(
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  (req: AppRequest, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const lang = req.query.lang ? req.query.lang : req.cookies.lang;
        const claim = await getCaseDataFromStore(generateRedisKey(req));

        if (!claim.claimFee?.calculatedAmountInPence) {
          throw new Error();
        }
        const claimFee = convertToPoundsFilter(
          claim.claimFee?.calculatedAmountInPence,
        );
        renderView(req, res, claim, lang, claimFee);
      } catch (error) {
        next(error);
      }
    })();
  },
);

judgmentAmountSummaryExtendedController.post(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL, (req: AppRequest, res: Response) => {
  (async () => {
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
    await saveDraftClaim(claim.id, claim, true);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
  })();
},
);

export default judgmentAmountSummaryExtendedController;
