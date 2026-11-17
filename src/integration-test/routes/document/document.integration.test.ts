import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {VIEW_MEDIATION_DOCUMENTS} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {Document} from '../../../main/common/models/document/document';
import {MediationDocumentsReferred, MediationUploadDocumentsCCD} from '../../../main/common/models/mediation/uploadDocuments/uploadDocumentsCCD';

const CLAIM_ID = '000MC6286';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const mediationDocument = (fileName: string): MediationUploadDocumentsCCD => {
  const document: Document = {
    document_url: 'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51',
    document_binary_url: 'http://dm-store:8080/documents/757f50dc-6978-4cf8-8fa0-38e05bde2d51/binary',
    document_filename: fileName,
  };
  const upload = new MediationUploadDocumentsCCD();
  upload.id = fileName;
  upload.value = new MediationDocumentsReferred(document, new Date('2024-01-01'), 'Witness statement', new Date('2024-01-01'));
  return upload;
};

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.app1MediationDocumentsReferred = [mediationDocument('claimant-statement.pdf')];
  claim.res1MediationDocumentsReferred = [mediationDocument('defendant-statement.pdf')];
  return claim;
};

describe('Integration: mediation documents', () => {
  beforeEach(() => {
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(buildClaim());
  });

  it('renders the mediation documents page', async () => {
    const response = await request(app).get(route(VIEW_MEDIATION_DOCUMENTS));

    expect(response.status).toBe(200);
    expect(response.text).toContain('View mediation documents');
  });
});
