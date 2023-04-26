import {CCDClaim} from "models/civilClaimResponse";
import {toCUIFullAdmission} from "services/translation/convertToCUI/convertToCUIFullAdmission";
import {CCDPaymentOption} from "models/ccdResponse/ccdPaymentOption";
import {PaymentOptionType} from "form/models/admission/paymentOption/paymentOptionType";
import {FullAdmission} from "models/fullAdmission";

describe('toCUIFullAdmission', () => {
  it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with undefined', () => {
    // Given
    const ccdClaim: CCDClaim = undefined;
    // When
    const cuiFullAdmission = toCUIFullAdmission(ccdClaim);
    // Then
    expect(cuiFullAdmission).toMatchObject(new FullAdmission());
  });
  it('Respond to claim & pay IMMEDIATELY', () => {
    // Given
    const ccdClaim: CCDClaim = {
      defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
    } as CCDClaim;
    // When
    const cuiFullAdmission = toCUIFullAdmission(ccdClaim);
    // Then
    expect(cuiFullAdmission.paymentIntention.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
  });
});
