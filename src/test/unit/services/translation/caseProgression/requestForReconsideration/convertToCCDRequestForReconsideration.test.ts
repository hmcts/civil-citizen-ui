import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  translateDraftRequestForReconsiderationToCCD,
} from 'services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration';

describe('translateDraftRequestForReconsiderationToCCD', () => {
  it('should map claimant request for review comments', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReviewClaimant = new RequestForReviewForm('claimant comments');

    expect(translateDraftRequestForReconsiderationToCCD(claim)).toEqual({
      requestForReviewCommentsClaimant: 'claimant comments',
    });
  });

  it('should map defendant request for review comments', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReviewDefendant = new RequestForReviewForm('defendant comments');

    expect(translateDraftRequestForReconsiderationToCCD(claim)).toEqual({
      requestForReviewCommentsDefendant: 'defendant comments',
    });
  });

  it('should return undefined textArea when request form is missing', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.caseProgression = new CaseProgression();

    expect(translateDraftRequestForReconsiderationToCCD(claim)).toEqual({
      requestForReviewCommentsClaimant: undefined,
    });
  });
});
