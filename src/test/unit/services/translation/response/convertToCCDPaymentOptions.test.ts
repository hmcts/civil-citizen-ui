import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {toCCDPaymentOption} from 'services/translation/response/convertToCCDPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';

describe('convert payment option', () => {
  it('return payment options IMMEDIATELY', () => {
    const claim: Claim = new Claim();
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption: PaymentOptionType.IMMEDIATELY,
      },
    };

    const result = toCCDPaymentOption(claim);
    expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
  });

  it('return payment options INSTALMENTS', () => {
    const claim: Claim = new Claim();
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption: PaymentOptionType.INSTALMENTS,
      },
    };

    const result = toCCDPaymentOption(claim);
    expect(result).toEqual(CCDPaymentOption.REPAYMENT_PLAN);
  });

  it('return payment options BY_SET_DATE', () => {
    const claim: Claim = new Claim();
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
    };
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption: PaymentOptionType.BY_SET_DATE,
      },
    };

    const result = toCCDPaymentOption(claim);
    expect(result).toEqual(CCDPaymentOption.BY_SET_DATE);
  });
});
