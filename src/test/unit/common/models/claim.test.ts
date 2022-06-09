import {Claim} from '../../../../main/common/models/claim';
import {InterestClaimUntilType, InterestClaimFromType, InterestClaimOptions, SameRateInterestType} from '../../../../main/common/form/models/claimDetails';
import {StatementOfMeans} from '../../../../main/common/models/statementOfMeans';
import {Disability} from '../../../../main/common/form/models/statementOfMeans/disability';
import {YesNo} from '../../../../main/common/form/models/yesNo';
import {SevereDisability} from '../../../../main/common/form/models/statementOfMeans/severeDisability';
import {PartnerDisability} from '../../../../main/common/form/models/statementOfMeans/partner/partnerDisability';
import {Cohabiting} from '../../../../main/common/form/models/statementOfMeans/partner/cohabiting';
import {ChildrenDisability} from '../../../../main/common/form/models/statementOfMeans/dependants/childrenDisability';
import {Dependants} from '../../../../main/common/form/models/statementOfMeans/dependants/dependants';

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

describe('Claim isDefendantDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty disability', () => {
    //Given
    claim.statementOfMeans.disability = new Disability();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.NO;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.YES;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeTruthy;
  });
});

describe('Claim isDefendantSeverlyDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantSeverlyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantSeverlyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty severe disability', () => {
    //Given
    claim.statementOfMeans.severeDisability = new SevereDisability();
    //When
    const result = claim.isDefendantSeverlyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.NO;
    //When
    const result = claim.isDefendantSeverlyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.YES;
    //When
    const result = claim.isDefendantSeverlyDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isPartnerDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.partnerDisability = new PartnerDisability();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty cohabiting ', () => {
    //Given
    claim.statementOfMeans.cohabiting = new Cohabiting();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no partner ', () => {
    //Given
    claim.statementOfMeans.cohabiting.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.YES;
    claim.statementOfMeans.cohabiting.option = YesNo.YES;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isChildrenDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.childrenDisability = new ChildrenDisability();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.NO;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty Dependants', () => {
    //Given
    claim.statementOfMeans.dependants = new Dependants();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no children ', () => {
    //Given
    claim.statementOfMeans.dependants.declared =false;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.YES;
    claim.statementOfMeans.dependants.declared = true;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

