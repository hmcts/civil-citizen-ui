import nock from 'nock';
import config from 'config';
import {
  CCJ_CHECK_AND_SEND_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

const request = require('supertest');
const {app} = require('../../../../../../main/app');
const session = require('supertest-session');
const data = require('../../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claimantResponse/ccj/ccjCheckAnswersService');

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should return check answers page', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    const res = await request(app).get(CCJ_CHECK_AND_SEND_URL);
    expect(res.status).toBe(200);
    expect(res.text).toContain(checkYourAnswerEng);
  }, 10000);

  it('should return http 500 when has error in the get method', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    const res = await request(app).get(CCJ_CHECK_AND_SEND_URL);
    expect(res.status).toBe(500);
    expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
  });

  it('should pass english translation via query', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await session(app).get(CCJ_CHECK_AND_SEND_URL)
      .query({lang: 'en'})
      .expect((res: Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(checkYourAnswerEng);
      });
  });

  it('should pass cy translation via query', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await session(app).get(CCJ_CHECK_AND_SEND_URL)
      .query({lang: 'cy'})
      .expect((res: Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(checkYourAnswerCy);
      });
  });
});

describe('on Post', () => {
  it('should return errors when form is incomplete', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    const data = {signed: ''};
    await request(app)
      .post(CCJ_CHECK_AND_SEND_URL)
      .send(data)
      .expect((res: Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('I declare that the details I have given are true to the best of my knowledge.');
      });
  });

  it('should return 500 when error in service', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .post(CCJ_CHECK_AND_SEND_URL)
      .send(data)
      .expect((res: Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

