import {Claim} from 'common/models/claim';
import {ResponseType} from 'common/form/models/responseType';
import {Party} from 'common/models/party';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {PartyDetails} from 'common/form/models/partyDetails';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {buildClaimantResponseSection, buildNextStepsSection} from 'services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/confirmationContentBuilder';
import {formatDateToFullDate} from 'common/utils/dateUtils';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Claimant Response Confirmation service', () => {
  const lang = 'en';

  describe('Dispute Scenario when claimant intention is not to proceed with claim', () => {

    const claim = getClaim();

    it('should display submit status', () => {
      const claimantResponseSection = buildClaimantResponseSection(claim, lang);
      expect(claimantResponseSection[0].data?.title).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM');
      expect(claimantResponseSection[0].data?.html).toContain('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER');
      expect(claimantResponseSection[0].data?.html).toContain('000MC009');
      expect(claimantResponseSection[0].data?.html).toContain(formatDateToFullDate(new Date()));
    });

    it('should display next steps section', () => {
      const nextStepsSection = buildNextStepsSection(claim, lang);
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      expect(nextStepsSection[0].data?.text).toEqual('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT');
      expect(nextStepsSection[1].data?.text).toEqual('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.CLAIM_ENDED');
    });
  });
});

function getClaim (){
  const claim = new Claim();
  claim.legacyCaseReference = '000MC009';
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({partyName: 'Version 1'});
  claim.respondent1ResponseDeadline = new Date();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.intentionToProceed = {option: 'no'};
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  claim.rejectAllOfClaim = new RejectAllOfClaim(
    RejectAllOfClaimType.DISPUTE,
  );
  return claim;
}
