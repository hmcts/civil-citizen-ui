import config from 'config';
import { NextFunction, Response, Router } from 'express';
import { AppRequest } from '../../../common/models/AppRequest';
import { getCaseDataFromStore } from '../../../modules/draft-store/draftStoreService';
import { CLAIM_TOTAL_URL } from '../../urls';
import { CivilServiceClient } from 'client/civilServiceClient';
import { convertToPoundsFilter } from '../../../common/utils/currencyFormat';
import { YesNo } from '../../../common/form/models/yesNo';
import { InterestClaimOptionsType } from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import { InterestClaimFromType, SameRateInterestType } from '../../../common/form/models/claimDetails';
import { Claim } from '../../../common/models/claim';
import { getNumberOfDaysBetweenTwoDays } from '../../../common/utils/dateUtils';

const INTEREST_8 = 8;
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
    const hasInterest = claim.claimInterest === YesNo.YES ? true : false;
    let interestToDate: number = 0;

    if (hasInterest) {
      interestToDate = calculateInterestToDate(claim);
    }

    const totalAmount = claim.totalClaimAmount + claimFee + interestToDate;
    const hearingResponse = await civilServiceClient.getHearingAmount(totalAmount, <AppRequest>req);
    const hearingAmount = convertToPoundsFilter(hearingResponse.calculatedAmountInPence);

    const form = {
      claimAmount: claim.totalClaimAmount,
      interestToDate: interestToDate,
      claimFee: claimFee,
      totalClaimAmount: totalAmount,
      hearingAmount: hearingAmount,
      hasInterest: hasInterest,
    };
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

const calculateInterestToDate = (claim: Claim) => {
  if (claim.interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST) {
    return claim.interest?.totalInterest?.amount;
  }
  const interestPercent = getInterestPercent(claim);
  const interestStartDate = getInterestStartDate(claim);
  return calculateInterest(
    claim.totalClaimAmount,
    interestPercent,
    interestStartDate,
    new Date()
  );
}

const getInterestStartDate = (claim: Claim): Date => {
  if (claim.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
    return new Date(claim.interest?.interestStartDate?.date);
  }
  return new Date();
}

const getInterestPercent = (claim: Claim): number => {
  let interestPercent: number = INTEREST_8;
  if (claim.sameRateInterestSelection.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE) {
    interestPercent = claim.sameRateInterestSelection.differentRate;
  }
  return interestPercent;
}

const calculateInterest = (amount: number, interest: number, startDate: Date, endDate: Date): number => {
  const days = getNumberOfDaysBetweenTwoDays(startDate, endDate);
  return ((amount * (interest / 100)) / 365) * days;
}

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
