import {ClaimantResponse} from 'common/models/claimantResponse';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';

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

  describe('isClaimantIntendedToProceed', () => {
    const claimantResponse = new ClaimantResponse();
    it('should return false with empty claimantResponse object', () => {
      //When
      const result = claimantResponse.isClaimantIntendedToProceed;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with empty intentionToProceed object', () => {
      //Given
      claimantResponse.intentionToProceed = {};
      //When
      const result = claimantResponse.isClaimantIntendedToProceed;
      //Then
      expect(result).toBe(false);
    });

    it('should return false with intentionToProceed option no', () => {
      //Given
      claimantResponse.intentionToProceed = { 'option': 'no' };
      //When
      const result = claimantResponse.isClaimantIntendedToProceed;
      //Then
      expect(result).toBe(false);
    });

    it('should return true with intentionToProceed option yes', () => {
      //Given
      claimantResponse.intentionToProceed = { 'option': 'yes' };
      //When
      const result = claimantResponse.isClaimantIntendedToProceed;
      //Then
      expect(result).toBe(true);
    });

  });
});
