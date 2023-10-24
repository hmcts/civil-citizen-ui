import {ClaimAmountBreakup} from '../../../common/form/models/claimDetails';
import {CCDClaimAmountBreakup} from '../../../common/models/ccdResponse/ccdClaimAmountBreakup';
import {convertToPenceFromString} from 'services/translation/claim/moneyConversation';

export const toCCDClaimAmount = (claimAmountBreakup: ClaimAmountBreakup[]): CCDClaimAmountBreakup[] => {
  if (!claimAmountBreakup) return undefined;
  const ccdClaimAmountBreakupList: CCDClaimAmountBreakup[] = [];
  claimAmountBreakup.forEach((item, index) => {
    const ccdClaimAmountBreakup: CCDClaimAmountBreakup = {
      id: index.toString(),
      value: {
        claimAmount: convertToPenceFromString(item.value.claimAmount).toString(),
        claimReason: item.value.claimReason,
      },
    };
    ccdClaimAmountBreakupList.push(ccdClaimAmountBreakup);
  });
  return ccdClaimAmountBreakupList;
};
