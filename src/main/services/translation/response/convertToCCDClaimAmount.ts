
import {ClaimAmountBreakup} from "../../../common/form/models/claimDetails";
import {CCDClaimAmountBreakup} from "../../../common/models/ccdResponse/ccdClaimAmountBreakup";

export const toCCDClaimAmount = (claimAmountBreakup: ClaimAmountBreakup[]): CCDClaimAmountBreakup[] => {
  const ccdClaimAmountBreakupList: CCDClaimAmountBreakup[] = [];
  claimAmountBreakup.forEach((item, index) => {
    const ccdEvidence: CCDClaimAmountBreakup = {
      id: index.toString(),
      value: {
        claimAmount: item.value.claimAmount,
        claimReason: item.value.claimReason,
      },
    };
    ccdClaimAmountBreakupList.push(ccdEvidence);
  });
  return ccdClaimAmountBreakupList;
};
