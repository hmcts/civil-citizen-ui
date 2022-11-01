import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CONFIRMATION_URL} from '../../../../../main/routes/urls';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../main/common/models/party';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

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
    it('should return submit confirmation from claim', async () => {
      const claim = new Claim();
      const now = new Date();
      claim.respondent1ResponseDate = new Date(now.setDate(now.getDate() - 1));
      claim.applicant1 = new Party();
      claim.applicant1 = {
        individualFirstName: 'Joe',
        individualLastName: 'Bloggs',
      };
      mockGetCaseData.mockImplementation(async () => claim);
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
