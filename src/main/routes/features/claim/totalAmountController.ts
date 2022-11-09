import config from 'config';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from '../../../common/models/AppRequest';
import { getCaseDataFromStore } from '../../../modules/draft-store/draftStoreService';
import { CLAIM_TOTAL_URL } from '../../urls';
import { CivilServiceClient } from 'client/civilServiceClient';
import { convertToPoundsFilter } from '../../../common/utils/currencyFormat';

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
    // TODO: calculate interest
    const interestToDate = 100;
    const totalAmount = claim.totalClaimAmount + claimFee + interestToDate;
    const hearingResponse = await civilServiceClient.getHearingAmount(totalAmount, <AppRequest>req);
    const hearingAmount = convertToPoundsFilter(hearingResponse.calculatedAmountInPence);
    
    // TODO: create interface for that model
    const form = {
      claimAmount: claim.totalClaimAmount,
      interestToDate: interestToDate,
      claimFee: claimFee,
      totalAmount: totalAmount,
      hearingAmount: hearingAmount,
    };
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

// totalAmountController.post(CLAIM_HELP_WITH_FEES_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = (<AppRequest>req).session?.user?.id;
//     const referenceNumber = req.body.option === YesNo.NO ? '' : req.body.referenceNumber;
//     const helpWithFees = new HelpWithFees(req.body.option, referenceNumber);
//     const form = new GenericForm(helpWithFees);
//     form.validateSync();
//     if (form.hasErrors()) {
//       renderView(form, res);
//     } else {
//       await saveClaimDetails(userId, form.model, helpWithFeesPropertyName);
//       res.redirect(CLAIM_TOTAL_URL);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

export default totalAmountController;
