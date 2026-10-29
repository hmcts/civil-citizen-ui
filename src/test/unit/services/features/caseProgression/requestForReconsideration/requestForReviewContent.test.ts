import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CaseDocument} from 'models/document/caseDocument';
import {DocumentType} from 'models/document/documentType';
import {
  getNameRequestForReconsideration,
  getRequestForReconsiderationDocumentForConfirmation,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';

jest.mock('../../../../../../main/modules/i18n');
jest.retryTimes(0);

describe('reconsideration ownership', () => {
  const document = (owner: string): CaseDocument => ({
    createdBy: owner,
    documentLink: {
      document_url: `http://documents/${owner}`,
      document_binary_url: `http://documents/${owner}/binary`,
      document_filename: `${owner}.pdf`,
    },
    documentName: `${owner}.pdf`,
    documentType: DocumentType.REQUEST_FOR_RECONSIDERATION,
    documentSize: 12,
    createdDatetime: new Date('2026-01-01T12:00:00Z'),
  });

  it.each([
    [CaseRole.CLAIMANT, 'requestForReviewClaimant', 'claimant'],
    [CaseRole.DEFENDANT, 'requestForReviewDefendant', 'defendant'],
  ])('selects the storage field and confirmation document for %s', (role, property, owner) => {
    const claim = new Claim();
    claim.caseRole = role as CaseRole;
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReconsiderationDocument = document('claimant');
    claim.caseProgression.requestForReconsiderationDocumentRes = document('defendant');

    expect(getNameRequestForReconsideration(claim)).toBe(property);
    expect(getRequestForReconsiderationDocumentForConfirmation(claim)).toBe(`http://documents/${owner}/binary`);
  });
});
