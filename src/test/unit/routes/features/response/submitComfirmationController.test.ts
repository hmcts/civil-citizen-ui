import request from 'supertest';
import {app} from 'app';
import nock from 'nock';
import config from 'config';
import {CONFIRMATION_URL} from 'routes/urls';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockClaim = new Claim();
const now = new Date();
mockClaim.respondent1ResponseDate = new Date(now.setDate(now.getDate() - 1));
mockClaim.applicant1 = new Party();
mockClaim.applicant1 = {
  type: PartyType.INDIVIDUAL,
  partyDetails: {
    partyName: 'Joe Bloggs',
  },
};

describe('Submit confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, civilClaimResponseMock);
  });
  describe('on GET', () => {
    mockGetCaseData.mockImplementation(() => mockClaim);
    it('should return submit confirmation from claim', async () => {
      await request(app)
        .get(CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You&#39;ve submitted your response');
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
