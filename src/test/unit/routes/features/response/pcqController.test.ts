import config from 'config';
import nock from 'nock';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PCQ_URL} from 'routes/urls';

const {app} = require('../../../../../main/app');
const session = require('supertest-session');
jest.mock('../../../../../main/modules/oidc');

const CLAIM_ID = 'aaa';
const pcqUrl = constructResponseUrlWithIdParams(CLAIM_ID, PCQ_URL);

describe('Response - PCQ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const equalityAndDiversityQuestions = 'Equality and diversity questions';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should redirect to PCQ page', async () => {
    await session(app)
      .get(pcqUrl)
      .expect((res: Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(equalityAndDiversityQuestions);
      });
  });
});
