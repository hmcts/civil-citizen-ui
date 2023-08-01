import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, Response, Router } from 'express';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import config from 'config';
import { CLAIM_FEE_URL } from 'routes/urls';

const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimFeeBreakDownController.get(CLAIM_FEE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claim = await getCaseDataFromStore(userId);
    const claimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
    const totalAmount = claim.totalInterest ? (claim.totalClaimAmount + claim.totalInterest + claimFee) : (claim.totalClaimAmount + claimFee);
    return res.render(viewPath, { totalClaimAmount: claim.totalClaimAmount, interest: claim.totalInterest, claimFee, hasInterest: !!claim.totalInterest, totalAmount });

  } catch (error) {
    next(error);
  }
});

export default claimFeeBreakDownController;