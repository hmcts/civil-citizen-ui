import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
jest.mock('../../../main/services/caseDocuments/documentService', () => ({
  saveDocumentsToExistingClaim: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../main/services/features/response/submitConfirmation/submitConfirmationService', () => ({
  getClaimWithExtendedPaymentDeadline: jest.fn().mockResolvedValue(undefined),
}));
import {app} from '../../../main/app';
import {DEFENDANT_SUMMARY_URL} from '../../../main/routes/urls';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {PartyDetails} from '../../../main/common/form/models/partyDetails';
import {claimType} from '../../../main/common/form/models/claimType';
import {isDashboardEnabledForCase} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import * as caseProgressionLatestUpdateService from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';

const buildCaseProgressionHearing = (): CaseProgressionHearing => {
  const hearingDocument = new CaseProgressionHearingDocuments();
  hearingDocument.id = '1221';
  hearingDocument.value = {
    createdBy: 'Civil',
    documentLink: {
      document_url: 'http://dm-store:8080/documents/hearing',
      document_filename: 'hearing_small_claim.pdf',
      document_binary_url: 'http://dm-store:8080/documents/hearing/binary',
    },
    documentName: 'hearing_small_claim.pdf',
    documentSize: 56461,
    documentType: DocumentType.HEARING_FORM,
    createdDatetime: new Date('2026-06-15'),
  };
  return new CaseProgressionHearing(
    [hearingDocument],
    new HearingLocation({code: '1', label: 'Central London County Court'}),
    new Date(2026, 5, 20),
    '1000',
  );
};

const buildParties = () => {
  const applicant1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({firstName: 'Alice', lastName: 'Claimant'}),
  });
  const respondent1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: new PartyDetails({firstName: 'Bob', lastName: 'Defendant'}),
  });
  return {applicant1, respondent1};
};

const buildLegacyCpClaim = (id: string, track: claimType): Claim => {
  const claim = new Claim();
  const {applicant1, respondent1} = buildParties();
  claim.id = id;
  claim.caseRole = CaseRole.DEFENDANT;
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.responseClaimTrack = track;
  claim.totalClaimAmount = track === claimType.SMALL_CLAIM ? 900 : 15000;
  claim.submittedDate = new Date('2026-01-15');
  claim.applicant1 = applicant1;
  claim.respondent1 = respondent1;
  claim.sdoOrderDocument = {documentLink: {document_url: 'http://example/doc'}};
  return claim;
};

describe('Integration: case progression legacy updates tab', () => {
  beforeEach(() => {
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  it('renders bundle complete content when bundle is stitched', async () => {
    const claimId = '000MC-CP-LU-BUNDLE';
    const claim = buildLegacyCpClaim(claimId, claimType.SMALL_CLAIM);
    claim.caseProgression = {
      caseBundles: [{stitchedDocument: {documentLink: {document_url: 'http://example/bundle'}}}],
    };

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain('Bundle is complete and ready to view');
    expect(res.text).toContain('View bundle');
  });

  it('renders claim struck out when hearing fee was not paid', async () => {
    const claimId = '000MC-CP-LU-STK';
    const claim = buildLegacyCpClaim(claimId, claimType.SMALL_CLAIM);
    claim.caseDismissedHearingFeeDueDate = new Date('2023-11-10');
    claim.caseProgressionHearing = buildCaseProgressionHearing();

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain('Claim has been struck out');
  });

  it('renders upload documents when SDO is issued without a hearing', async () => {
    const claimId = '000MC-CP-LU-EVID';
    const claim = buildLegacyCpClaim(claimId, claimType.SMALL_CLAIM);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain('Upload documents');
    expect(res.text).toContain('You can upload and submit any documents which support your claim');
  });

  it('renders new documents uploaded when the other party uploaded recently', async () => {
    const claimId = '000MC-CP-LU-NEW';
    const claim = buildLegacyCpClaim(claimId, claimType.SMALL_CLAIM);
    claim.caseProgressionHearing = buildCaseProgressionHearing();
    claim.caseProgression = {claimantLastUploadDate: new Date('2026-06-14')};
    const evidenceUploadedSpy = jest
      .spyOn(caseProgressionLatestUpdateService, 'checkEvidenceUploaded')
      .mockReturnValue(true);

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    evidenceUploadedSpy.mockRestore();

    expect(res.text).toContain('New documents have been uploaded');
    expect(res.text).toContain('View documents');
  });

  it.each([
    {track: claimType.SMALL_CLAIM, expectedTitle: 'A hearing has been scheduled for your case'},
    {track: claimType.FAST_CLAIM, expectedTitle: 'A trial has been scheduled for your case'},
  ])('$track legacy tab shows scheduled $expectedTitle', async ({track, expectedTitle}) => {
    const claimId = `000MC-CP-LU-HRG-${track}`;
    const claim = buildLegacyCpClaim(claimId, track);
    claim.caseProgressionHearing = buildCaseProgressionHearing();

    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);

    const res = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', claimId)).expect(200);

    expect(res.text).toContain(expectedTitle);
    expect(res.text).toContain('View hearing notice');
  });
});
