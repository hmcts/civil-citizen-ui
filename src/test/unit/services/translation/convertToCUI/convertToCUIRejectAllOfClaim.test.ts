import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CCDRejectAllOfClaimType} from 'models/ccdResponse/ccdRejectAllOfClaimType';
import {toCUIRejectAllOfClaimType} from "services/translation/convertToCUI/convertToCUIRejectAllOfClaimType";

describe('translate RejectAllOfClaimType to CUI model', () => {

  it('should return ALREADY_PAID', () => {
    // Given
    const option = CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED;
    // When
    const rejectAlOfClaimTypeResponseCCD = toCUIRejectAllOfClaimType(option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(RejectAllOfClaimType.ALREADY_PAID);
  });

  it('should return DISPUTE', () => {
    // Given
    const option = CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM;
    // When
    const rejectAlOfClaimTypeResponseCCD = toCUIRejectAllOfClaimType(option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(RejectAllOfClaimType.DISPUTE);
  });

  it('should return DISPUTE', () => {
    // Given
    const option = CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM;
    // When
    const rejectAlOfClaimTypeResponseCCD = toCUIRejectAllOfClaimType(option);
    // Then
    expect(rejectAlOfClaimTypeResponseCCD).toBe(RejectAllOfClaimType.DISPUTE);
  });
});
