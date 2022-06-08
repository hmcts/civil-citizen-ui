import {Claim} from '../../../../main/common/models/claim';
import {InterestClaimUntilType, InterestClaimFromType, InterestClaimOptions, SameRateInterestType} from '../../../../main/common/form/models/claimDetails';
import {ResponseType} from '../../../../main/common/form/models/responseType';
import {CounterpartyType} from '../../../../main/common/models/counterpartyType';
import {PartialAdmission} from '../../../../main/common/models/partialAdmission';
import {Respondent} from '../../../../main/common/models/respondent';
import {HowMuchDoYouOwe} from '../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from '../../../../main/common/models/paymentIntention';
import PaymentOptionType from '../../../../main/common/form/models/admission/paymentOption/paymentOptionType';

describe('Claim isInterestClaimUntilSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_SETTLED_OR_JUDGEMENT_MADE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});
describe('Claim isInterestFromClaimSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestFromASpecificDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestClaimOptionsSameRateInterest', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.SAME_RATE_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.BREAK_DOWN_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isSameRateTypeEightPercent', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isFullAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Respondent();
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with partial admission', () => {
    //Given
    claim.respondent1 = {responseType: ResponseType.PART_ADMISSION, primaryAddress: {}, type: CounterpartyType.INDIVIDUAL};
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with full admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isPartialAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Respondent();
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with full admission', () => {
    //Given
    claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION, primaryAddress: {}, type: CounterpartyType.INDIVIDUAL};
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with part admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isFullAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty payment option', () => {
    //Given
    claim.paymentOption = undefined;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with payment option', () => {
    //Given
    claim.paymentOption = PaymentOptionType.INSTALMENTS;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isPartialAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim partialAdmissionPaymentAmount', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with part admit empty HowMuchDoYouOwe', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return existing amount', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe.amount = 55;
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toEqual(55);
  });
});


