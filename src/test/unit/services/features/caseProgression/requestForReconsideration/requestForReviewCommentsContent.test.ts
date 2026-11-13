import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {
  getClaimantOrDefendant,
  getRequestForReviewCommentsContent,
  getRequestForReconsiderationCommentsConfirmationContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({t: (key: string) => key, use: jest.fn()}));
jest.retryTimes(0);

describe('reconsideration comments counterparty', () => {
  it.each([
    {role: CaseRole.CLAIMANT, counterparty: 'Bob Defendant'},
    {role: CaseRole.DEFENDANT, counterparty: 'Alice Claimant'},
  ])('names the other party for $role on the comments and confirmation pages', ({role, counterparty}) => {
    const claim = new Claim();
    claim.id = '123';
    claim.caseRole = role;
    claim.totalClaimAmount = 1000;
    claim.applicant1 = new Party();
    claim.applicant1.type = PartyType.INDIVIDUAL;
    claim.applicant1.partyDetails = new PartyDetails({firstName: 'Alice', lastName: 'Claimant'});
    claim.respondent1 = new Party();
    claim.respondent1.type = PartyType.INDIVIDUAL;
    claim.respondent1.partyDetails = new PartyDetails({firstName: 'Bob', lastName: 'Defendant'});

    const comments = getRequestForReviewCommentsContent(claim, claim.id);
    const confirmation = getRequestForReconsiderationCommentsConfirmationContent(claim, 'en', '/dashboard/:id');

    expect(getClaimantOrDefendant(claim)).toBe(counterparty);
    expect(comments.find(section => section.data?.text === 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.WILL_SEE_COMMENTS')?.data.variables)
      .toEqual({claimantOrDefendant: counterparty});
    expect(confirmation.find(section => section.data?.text === 'PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.LET_OTHER_PARTY_KNOW')?.data.variables)
      .toEqual({claimantOrDefendant: counterparty});
  });
});
