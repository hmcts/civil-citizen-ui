import {
  getRequestForReviewCommentsForm,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsService';
import {Claim} from 'models/claim';
import {
  RequestForReviewCommentsForm,
} from 'models/caseProgression/requestForReconsideration/requestForReviewCommentsForm';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CaseRole} from 'form/models/caseRoles';

describe('request for review comments service', () => {

  const claim = new Claim;
  const expectedClaimantForm = new RequestForReviewCommentsForm('claimant');
  const expectedDefendantForm = new RequestForReviewCommentsForm('defendant');
  claim.caseProgression = new CaseProgression();
  claim.caseProgression.requestForReviewClaimant = expectedClaimantForm;
  claim.caseProgression.requestForReviewDefendant = expectedDefendantForm;

  it('get Request For Review Comments Form for claimant', () => {

    claim.caseRole = CaseRole.CLAIMANT;

    const actualForm = getRequestForReviewCommentsForm(claim);

    expect(actualForm).toStrictEqual(expectedClaimantForm);
  });

  it('get Request For Review Comments Form for defendant', () => {

    claim.caseRole = CaseRole.DEFENDANT;

    const actualForm = getRequestForReviewCommentsForm(claim);

    expect(actualForm).toStrictEqual(expectedDefendantForm);
  });
});
