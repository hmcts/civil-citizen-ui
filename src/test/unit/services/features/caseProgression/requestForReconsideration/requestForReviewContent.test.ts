import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CaseDocument} from 'models/document/caseDocument';
import {DocumentType} from 'models/document/documentType';
import {
  getClaimantOrDefendant,
  getRequestForReviewContent,
  getRequestForReconsiderationConfirmationContent,
  getNameRequestForReconsideration,
  getRequestForReconsiderationDocumentForConfirmation,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';

jest.mock('../../../../../../main/modules/i18n');
jest.retryTimes(0);

describe('reconsideration ownership', () => {
  it.each([
    {role: CaseRole.CLAIMANT, counterparty: 'Bob Defendant'},
    {role: CaseRole.DEFENDANT, counterparty: 'Alice Claimant'},
  ])('propagates the counterparty name for $role through request and confirmation', ({role, counterparty}) => {
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
    claim.caseProgression = new CaseProgression();
    claim.caseProgression.requestForReconsiderationDeadline = new Date('2026-12-01');

    const request = getRequestForReviewContent(claim, claim.id);
    const confirmation = getRequestForReconsiderationConfirmationContent(claim, 'en', '/dashboard/:id');

    expect(getClaimantOrDefendant(claim)).toBe(counterparty);
    expect(request.find(section => section.data?.text === 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.PARAGRAPH')?.data.variables)
      .toEqual({claimantOrDefendant: counterparty});
    expect(confirmation.find(section => section.data?.text === 'PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_1')?.data.variables)
      .toMatchObject({claimantOrDefendant: counterparty});
  });

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
