import {InterestClaimOptionsType} from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import {CCDInterestType} from '../../../common/models/ccdResponse/ccdInterestType';

export const toCCDInterestType = (interestClaimOptions: InterestClaimOptionsType): CCDInterestType => {
  switch (interestClaimOptions) {
    case InterestClaimOptionsType.BREAK_DOWN_INTEREST:
      return CCDInterestType.BREAK_DOWN_INTEREST;
    case InterestClaimOptionsType.SAME_RATE_INTEREST:
      return CCDInterestType.SAME_RATE_INTEREST;
    default:
      return undefined;
  } 
};
