import {
  SameRateInterestSelection,
  SameRateInterestType,
} from '../../../common/form/models/claimDetails';
import {
  CCDSameRateInterestType,
  CCDSameRateInterestSelection,
} from '../../../common/models/ccdResponse/ccdSameRateInterestSelection';

export const toCCDSameRateInterestSelection = (sameRateInterestSelection: SameRateInterestSelection): CCDSameRateInterestSelection => {
  if (!sameRateInterestSelection) return undefined;
  return {
    sameRateInterestType: sameRateInterestSelection.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC
      ? CCDSameRateInterestType.SAME_RATE_INTEREST_8_PC
      : CCDSameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
    differentRate: sameRateInterestSelection.differentRate,
    differentRateReason: sameRateInterestSelection.reason,
  };
};
