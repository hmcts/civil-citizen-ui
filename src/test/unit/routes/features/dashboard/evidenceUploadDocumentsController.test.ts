// import Module from 'module';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CaseState} from 'form/models/claimDetails';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {CaseRole} from 'form/models/caseRoles';
import civilClaimResponse from '../../../../utils/mocks/civilClaimResponseDocumentUploadedMock.json';

const nock = require('nock');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');
jest.mock('services/features/dashboard/claimSummaryService');
jest.mock('services/caseDocuments/documentService');
jest.mock('services/features/caseProgression/bundles/bundlesService');

describe('Evidence upload documents', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: civilClaimResponse});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: civilClaimResponse});
  });

  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const claimWithSdo = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
    case_data: {
      ...claim.case_data,
    },
  };

  describe('on GET', () => {
    it('should return evidence upload documents on claimant', async () => {
      //given

      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.CLAIMANT]);
      //then
      await request(app)
        .get(`/case/${claimId}/evidence-upload-documents`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View documents');
          expect(res.text).toContain('Hearing');
          expect(res.text).toContain('Read and save all documents uploaded by the parties involved in the claim. 10 days before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
        });
    });

    it('should return evidence upload documents on defendant', async () => {
      //given

      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId  + '/userCaseRoles')
        .reply(200, [CaseRole.DEFENDANT]);
      //then
      await request(app)
        .get(`/case/${claimId}/evidence-upload-documents`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('View documents');
          expect(res.text).toContain('Hearing');
          expect(res.text).toContain('Read and save all documents uploaded by the parties involved in the claim. 10 days before the hearing, a bundle will be created containing all submitted documents in one place. You will be told when this is available.');
        });
    });
  });
});
