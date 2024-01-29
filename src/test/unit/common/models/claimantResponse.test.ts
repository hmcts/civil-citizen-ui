import {ClaimantResponse} from 'common/models/claimantResponse';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {Mediation} from 'models/mediation/mediation';
import {YesNo} from 'form/models/yesNo';

describe('ClaimantResponse model', () => {
  describe('isClaimantSuggestedPayImmediately', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty claimantResponse object', () => {
      //When
      const result = claimantResponse.isClaimantSuggestedPayImmediately;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty suggestedPaymentIntention object', () => {
      //Given
      claimantResponse.suggestedPaymentIntention = {};
      //When
      const result = claimantResponse.isClaimantSuggestedPayImmediately;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by set date', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      //When
      const result = claimantResponse.isClaimantSuggestedPayImmediately;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by instalments', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      //When
      const result = claimantResponse.isClaimantSuggestedPayImmediately;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with pay immediately', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      //When
      const result = claimantResponse.isClaimantSuggestedPayImmediately;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isClaimantSuggestedPayByDate', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty claimantResponse object', () => {
      //When
      const result = claimantResponse.isClaimantSuggestedPayByDate;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty suggestedPaymentIntention object', () => {
      //Given
      claimantResponse.suggestedPaymentIntention = {};
      //When
      const result = claimantResponse.isClaimantSuggestedPayByDate;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by immediately', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByDate;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by instalments', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByDate;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with pay by set date', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByDate;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isClaimantSuggestedPayByInstalments', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty claimantResponse object', () => {
      //When
      const result = claimantResponse.isClaimantSuggestedPayByInstalments;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty suggestedPaymentIntention object', () => {
      //Given
      claimantResponse.suggestedPaymentIntention = {};
      //When
      const result = claimantResponse.isClaimantSuggestedPayByInstalments;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by immediately', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByInstalments;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with pay by set date', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByInstalments;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with pay by instalments', () => {
      //Given
      claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      //When
      const result = claimantResponse.isClaimantSuggestedPayByInstalments;
      //Then
      expect(result).toBe(true);
    });

    it('should return REQUEST_BY_CCJ when claimant asked for it', () => {
      //Given
      claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      //When
      const result = claimantResponse.isCCJRequested;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isClaimantNotAcceptedPartAdmittedAmount', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty claimantResponse object', () => {
      //When
      const result = claimantResponse.isClaimantNotAcceptedPartAdmittedAmount;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty hasPartAdmittedBeenAccepted object', () => {
      //Given
      claimantResponse.hasPartAdmittedBeenAccepted = {};
      //When
      const result = claimantResponse.isClaimantNotAcceptedPartAdmittedAmount;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with hasPartAdmittedBeenAccepted option yes', () => {
      //Given
      claimantResponse.hasPartAdmittedBeenAccepted = { 'option': 'Yes' };
      //When
      const result = claimantResponse.isClaimantNotAcceptedPartAdmittedAmount;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with hasPartAdmittedBeenAccepted option no', () => {
      //Given
      claimantResponse.hasPartAdmittedBeenAccepted = { 'option': 'no' };
      //When
      const result = claimantResponse.isClaimantNotAcceptedPartAdmittedAmount;
      //Then
      expect(result).toBe(true);
    });

  });

  describe('hasClaimantNotAgreedToMediation', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty mediation object', () => {
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with undefined mediation object', () => {
      claimantResponse.mediation = undefined;
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty mediationDisagreement object', () => {
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.mediationDisagreement = undefined;
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty option object', () => {
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.mediationDisagreement = {
        option: undefined,
      };
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with option is Yes', () => {
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.mediationDisagreement = {
        option:  YesNo.YES,
      };
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return true with option is No', () => {
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.mediationDisagreement = {
        option:  YesNo.NO,
      };
      //When
      const result = claimantResponse.hasClaimantNotAgreedToMediation();
      //Then
      expect(result).toBe(true);
    });
  });

  describe('hasClaimantAgreedToMediation', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty mediation object', () => {
      //When
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with undefined mediation object', () => {
      //When
      claimantResponse.mediation = undefined;
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty canWeUse and companyTelephoneNumber object', () => {
      //When
      claimantResponse.mediation = new Mediation();
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return true with canWeUse is Yes', () => {
      //When
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.canWeUse = {
        option:  YesNo.YES,
      };
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(true);
    });

    it('should return true with mediationPhoneNumber is input', () => {
      //When
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.canWeUse = {
        mediationPhoneNumber:  '0123456789',
      };
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(true);
    });

    it('should return false with companyTelephoneNumber is undefined', () => {
      //When
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.companyTelephoneNumber = undefined;
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(false);
    });

    it('should return true with companyTelephoneNumber option is no', () => {
      //When
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.companyTelephoneNumber = {
        option: YesNo.NO,
      };
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(true);
    });

    it('should return true with mediationPhoneNumberConfirmation is input', () => {
      //When
      claimantResponse.mediation = new Mediation();
      claimantResponse.mediation.companyTelephoneNumber = {
        mediationPhoneNumberConfirmation: '0123456789',
      };
      const result = claimantResponse.hasClaimantAgreedToMediation();
      //Then
      expect(result).toBe(true);
    });
  });
});
