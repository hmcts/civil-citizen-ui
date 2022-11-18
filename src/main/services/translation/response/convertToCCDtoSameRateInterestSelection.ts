import {
  SameRateInterestSelection,
  SameRateInterestType
} from '../../../common/form/models/claimDetails';
import {
  CCDRepaymentPlanFrequency,
  CCDSameRateInterestSelection
} from '../../../common/models/ccdResponse/ccdSameRateInterestSelection';

export const toCCDSameRateInterestSelection = (sameRateInterestSelection: SameRateInterestSelection): CCDSameRateInterestSelection => {
  return {
    sameRateInterestType: sameRateInterestSelection.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC
      ? CCDRepaymentPlanFrequency.SAME_RATE_INTEREST_8_PC
      : CCDRepaymentPlanFrequency.SAME_RATE_INTEREST_DIFFERENT_RATE,
    differentRate: sameRateInterestSelection.differentRate,
    differentRateReason: sameRateInterestSelection.reason,
  };
};
