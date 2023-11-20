import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {clearClaimantSuggestion} from 'routes/features/claimantResponse/clearClaimantSuggestionService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Clear claimant suggestion', () => {
  it('clear claimant suggestion ', async () => {
    //Given
    const claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await clearClaimantSuggestion('111', claim);
    //Then
    expect(spySave).toBeCalled();
  });
});
