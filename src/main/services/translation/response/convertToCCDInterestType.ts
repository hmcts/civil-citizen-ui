import {InterestClaimOptionsType} from '../../../common/form/models/claim/interest/interestClaimOptionsType';
import {CCDInterestType} from '../../../common/models/ccdResponse/ccdInterestType';

export const toCCDInterestType = (interestClaimOptions: InterestClaimOptionsType): CCDInterestType => {
  return interestClaimOptions === InterestClaimOptionsType.BREAK_DOWN_INTEREST
    ? CCDInterestType.BREAK_DOWN_INTEREST
    : CCDInterestType.SAME_RATE_INTEREST;
};
