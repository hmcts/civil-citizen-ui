import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, Response, Router } from 'express';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import config from 'config';
import { CLAIM_FEE_BREAKUP } from 'routes/urls';
import { YesNo } from 'common/form/models/yesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';

const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claim = 
    await getCaseDataFromStore(userId);
    const claimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = calculateInterestToDate(claim);
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);
    return res.render(viewPath, { totalClaimAmount: claim.totalClaimAmount, interest: interestAmount, claimFee, hasInterest, totalAmount });
  } catch (error) {
    next(error);
  }
});

export default claimFeeBreakDownController;