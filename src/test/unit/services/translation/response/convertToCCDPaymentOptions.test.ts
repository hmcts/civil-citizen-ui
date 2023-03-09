import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {toCCDPaymentOption} from 'services/translation/response/convertToCCDPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';

describe('convert payment option', () => {
  describe('UNDEFINED', () => {
    it('IMMEDIATELY', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('INSTALMENTS', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('BY_SET_DATE', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: undefined,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });
  });

  describe('PART ADMISSION', () => {
    it('return payment options IMMEDIATELY', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('return payment options INSTALMENTS', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.REPAYMENT_PLAN);
    });

    it('return payment options BY_SET_DATE', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.PART_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.BY_SET_DATE);
    });
  });

  describe('FULL_ADMISSION', () => {
    it('return payment options IMMEDIATELY', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('return payment options INSTALMENTS', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });

    it('return payment options BY_SET_DATE', () => {
      // GIVEN
      const claim: Claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      claim.partialAdmission = {
        paymentIntention: {
          paymentOption: PaymentOptionType.BY_SET_DATE,
        },
      };
      // WHEN
      const result = toCCDPaymentOption(claim);
      // THEN
      expect(result).toEqual(CCDPaymentOption.IMMEDIATELY);
    });
  });
});
