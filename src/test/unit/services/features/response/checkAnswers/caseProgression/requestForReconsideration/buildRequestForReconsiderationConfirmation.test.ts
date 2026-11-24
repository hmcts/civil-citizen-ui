import {REQUEST_FOR_RECONSIDERATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  buildRequestForReconsideration,
} from 'services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection';

jest.mock('../../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const claimId = '11';

describe('Request for reconsideration summary section', () => {
  it('should show the request text for the claimant', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReviewClaimant = new RequestForReviewForm('Please reconsider');

    const section = buildRequestForReconsideration(claim, claimId, 'en');

    expect(section.summaryList.rows[0].value.html).toBe('Please reconsider');
    expect(section.summaryList.rows[0].actions?.items[0].href).toBe(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', claimId));
  });

  it('should show an empty row with a change link when the request has not been answered', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.caseProgression = new CaseProgression();

    const section = buildRequestForReconsideration(claim, claimId, 'en');

    expect(section.summaryList.rows).toHaveLength(1);
    expect(section.summaryList.rows[0].value.html).toBeUndefined();
    expect(section.summaryList.rows[0].actions?.items[0].href).toBe(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', claimId));
  });

  it('should not throw when the claim has no case progression data', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;

    expect(() => buildRequestForReconsideration(claim, claimId, 'en')).not.toThrow();
  });
});
