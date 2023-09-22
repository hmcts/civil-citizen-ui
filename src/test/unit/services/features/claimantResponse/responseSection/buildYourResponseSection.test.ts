import * as constVal from '../../../../../utils/checkAnswersConstants';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {getSummarySections} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {ClaimantResponse} from 'models/claimantResponse';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';

describe('Full Defence - Your Response', () => {
  describe('Full Defence- Dispute the claim', () => {
    it('should return your response section', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = {
        responseType: ResponseType.FULL_DEFENCE,
      };
      claim.rejectAllOfClaim = new RejectAllOfClaim();
      claim.rejectAllOfClaim.option = RejectAllOfClaimType.DISPUTE;

      claim.claimantResponse = new ClaimantResponse(),
      claim.claimantResponse.intentionToProceed = {
        option: YesNo.YES,
      };
      //When
      const summarySections = getSummarySections(constVal.CLAIM_ID, claim);
      //Then
      expect(summarySections.sections[1].title).toBe('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE');
      expect(summarySections.sections[1].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM');
      expect(summarySections.sections[1].summaryList.rows[0].value.html).toBe('COMMON.YES');
      expect(summarySections.sections[1].summaryList.rows[0].actions.items[0].href).toBe('/case/claimId/claimant-response/intention-to-proceed');

    });
  });
});
