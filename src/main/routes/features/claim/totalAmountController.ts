import config from 'config';
import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../common/models/AppRequest';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CLAIM_TOTAL_URL, CLAIMANT_TASK_LIST_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {convertToPoundsFilter} from '../../../common/utils/currencyFormat';
import {calculateInterestToDate} from '../../../common/utils/interestUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const totalAmountController = Router();
const totalAmountViewPath = 'features/claim/total-amount';

function renderView(form: object, res: Response): void {
  res.render(totalAmountViewPath, {form});
}

totalAmountController.get(CLAIM_TOTAL_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claim = await getCaseDataFromStore(userId);
    const claimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
    const hearingResponse = await civilServiceClient.getHearingAmount(claim.totalClaimAmount, req);
    const hearingAmount = convertToPoundsFilter(hearingResponse.calculatedAmountInPence);
    let interestToDate = 0;

    if (claim.hasInterest()) {
      interestToDate = calculateInterestToDate(claim);
    }

    const form = {
      claimAmount: claim.totalClaimAmount?.toFixed(2),
      interestToDate,
      claimFee,
      totalClaimAmount: claim.totalClaimAmount + claimFee + interestToDate,
      hearingAmount,
      hasInterest: claim.hasInterest(),
      hasHelpWithFees: claim.hasHelpWithFees(),
    };
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

totalAmountController.post(CLAIM_TOTAL_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(CLAIMANT_TASK_LIST_URL);
  } catch (error) {
    next(error);
  }
});

export default totalAmountController;
