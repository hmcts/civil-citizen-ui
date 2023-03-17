import {PaymentOptionType} from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from '../../../../../main/common/models/ccdResponse/ccdPaymentOption';
import {toCCDPaymentOption} from '../../../../../main/services/translation/response/convertToCCDPaymentOption';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';

describe('translate payment option to ccd version', ()=> {
  const claim = new Claim();

  it.concurrent('should translate pay immediately to ccd version for part admit.concurrent', ()=> {
    //Given
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.IMMEDIATELY,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.PART_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.IMMEDIATELY);
  });
  it.concurrent('should translate pay by set date to ccd version for part admit.concurrent', ()=> {
    //Given
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.BY_SET_DATE,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.PART_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.BY_SET_DATE);
  });
  it.concurrent('should translate pay by pay by instalments to ccd version for part admit.concurrent', ()=> {
    //Given
    claim.partialAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.INSTALMENTS,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.PART_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.REPAYMENT_PLAN);
  });
  it.concurrent('should translate pay immediately to ccd version for full admit.concurrent', ()=> {
    //Given
    claim.fullAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.IMMEDIATELY,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.FULL_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.IMMEDIATELY);
  });
  it.concurrent('should translate pay by set date to ccd version for full admit.concurrent', ()=> {
    //Given
    claim.fullAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.BY_SET_DATE,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.FULL_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.BY_SET_DATE);
  });
  it.concurrent('should translate pay by pay by instalments to ccd version for full admit.concurrent', ()=> {
    //Given
    claim.fullAdmission = {
      paymentIntention: {
        paymentOption : PaymentOptionType.INSTALMENTS,
      },
    };
    claim.respondent1 = {
      responseType : ResponseType.FULL_ADMISSION,
    };
    //When
    const result = toCCDPaymentOption(claim);
    //Then
    expect(result).toBe(CCDPaymentOption.REPAYMENT_PLAN);
  });
});
