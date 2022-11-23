import {SameRateInterestSelection, SameRateInterestType} from 'common/form/models/claimDetails';

const getInterestRateForm = async (option: SameRateInterestType, rate: number | undefined, reason: string): Promise<SameRateInterestSelection> => {
  return {
    sameRateInterestType: option,
    differentRate: option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? rate : undefined,
    reason: option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? reason : '',
  };
};

export {
  getInterestRateForm,
};
