import {clearClaimantSuggestion} from 'routes/features/claimantResponse/clearClaimantSuggestionService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

describe('clear claimant suggestion', () => {
  it('clear claimant suggestion ', async () => {
    //Given
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = await clearClaimantSuggestion('111', claim);
    //Then
    expect(result.claimantResponse.suggestedPaymentIntention).toBeNull();
  });
});
