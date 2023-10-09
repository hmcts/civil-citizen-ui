import request from 'supertest';
import {CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';

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
    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', '1234123412341234'))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Documents uploaded');
      });
  });

  it('should render the page successfully on claimant request', async () => {

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

    app.locals.draftStoreClient = mockRedisFailure;
    const mockClaimId = '1645882162449409';
    const caseData = new Claim();
    caseData.caseProgression = new CaseProgression();

    await request(app).get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', mockClaimId))
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });

});
