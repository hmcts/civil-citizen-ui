import request from 'supertest';
import {CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {CivilServiceClient} from 'client/civilServiceClient';
import civilClaimDocumentUploaded from '../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../main/modules/oidc');

describe('Documents uploaded controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render the page successfully', async () => {
    const claim = Object.assign(new Claim(), civilClaimDocumentUploaded.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim)),
      );
    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', '1645882162449409'))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Documents uploaded');
      });
  });

  it('should render the page successfully on claimant request', async () => {
    const claim = Object.assign(new Claim(), civilClaimDocumentUploaded.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim)),
      );
    app.locals.draftStoreClient = mockCivilClaim;
    const mockClaimId = '1645882162449409';
    const caseData = new Claim();
    caseData.caseProgression = new CaseProgression();

    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', mockClaimId))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Documents uploaded');
      });
  });

  it('should return 500 error when there is a Redis failure', async () => {

    const error = new Error('Test error');
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockRejectedValueOnce(error);
    const mockClaimId = '1645882162449409';
    const caseData = new Claim();
    caseData.caseProgression = new CaseProgression();

    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', mockClaimId))
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });

});
