import {ClaimantResponse} from 'common/models/claimantResponse';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';

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

    it('should return true claimant accept payment plan', () => {
      //Given
      claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES)
      //When
      const result = claimantResponse.isClaimantAcceptPaymentPlan;
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
});
