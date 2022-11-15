import config from 'config';
import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../common/models/AppRequest';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CLAIM_TOTAL_URL, CLAIMANT_TASK_LIST_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {convertToPoundsFilter} from '../../../common/utils/currencyFormat';
import {YesNo} from '../../../common/form/models/yesNo';
import {calculateInterestToDate} from '../../../common/utils/interestUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const totalAmountController = Router();
const totalAmountViewPath = 'features/claim/total-amount';

function renderView(form: any, res: Response): void {
  res.render(totalAmountViewPath, { form });
}

totalAmountController.get(CLAIM_TOTAL_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claim = await getCaseDataFromStore(userId);
    const claimFeeResponse = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, <AppRequest>req);
    const claimFee = convertToPoundsFilter(claimFeeResponse.calculatedAmountInPence);
    const hearingResponse = await civilServiceClient.getHearingAmount(claim.totalClaimAmount, <AppRequest>req);
    const hearingAmount = convertToPoundsFilter(hearingResponse.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES ? true : false;
    const hasHelpWithFees = claim.claimDetails?.helpWithFees?.option === YesNo.YES ? true : false;
    let interestToDate = 0;

    if (hasInterest) {
      interestToDate = calculateInterestToDate(claim);
    }

    const form = {
      claimAmount: claim.totalClaimAmount,
      interestToDate,
      claimFee,
      totalClaimAmount: claim.totalClaimAmount + claimFee + interestToDate,
      hearingAmount,
      hasInterest,
      hasHelpWithFees,
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
