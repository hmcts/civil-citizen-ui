import nock from 'nock';
import config from 'config';
import {getSummarySections} from 'services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import request from 'supertest';

const {app} = require('../../../../../main/app');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/services/features/claim/submission/submitClaim');

const mockGetSummarySections = getSummarySections as jest.Mock;

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: data});
  });

  describe('on GET', () => {
    it('should return check your answer page', async () => {
      await request(app).get(CLAIM_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should redirect to claim submitted confirmation page', async () => {
      await request(app)
        .post(CLAIM_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res ) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CONFIRMATION_URL);
        });
    });
  });
});

