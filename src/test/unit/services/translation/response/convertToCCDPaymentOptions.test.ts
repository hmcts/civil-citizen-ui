import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {toCCDPaymentOption} from 'services/translation/response/convertToCCDPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';

describe('convert payment option', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
  });

  describe('response type is UNDEFINED', () => {
    it('payment option is IMMEDIATELY should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(undefined);
    });

    it('payment option is INSTALMENTS should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(undefined);
    });

    it('payment option is BY_SET_DATE should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(undefined);
    });
  });

  describe('response type PART ADMISSION', () => {
    it('when payment option is IMMEDIATELY should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('when payment options is INSTALMENTS should return REPAYMENT_PLAN', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(CCDPaymentOption.REPAYMENT_PLAN);
    });

    it('when payment options is BY_SET_DATE should return BY_SET_DATE', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(CCDPaymentOption.BY_SET_DATE);
    });
  });

  describe('response type is FULL_ADMISSION', () => {
    it('when payment option is IMMEDIATELY should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.fullAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('when payment option is INSTALMENTS should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.fullAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(CCDPaymentOption.REPAYMENT_PLAN);
    });

    it('when payment option is BY_SET_DATE should return IMMEDIATELY', () => {
      // GIVEN
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.fullAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim.getPaymentIntention()?.paymentOption);
      // THEN
      expect(result).toEqual(PaymentOptionType.BY_SET_DATE);
    });
  });
});
