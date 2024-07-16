import nock from 'nock';
import config from 'config';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import noRespondentTelephoneClaimantIntentionMock from '../../../../../test/utils/mocks/noRespondentTelephoneClaimantIntentionMock.json';
import {Claim} from 'common/models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Task} from 'models/taskList/task';
import {
  outstandingClaimantResponseTasks,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/claimantResponse/ccj/ccjCheckAnswersService');
jest.mock('../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('../../../../../main/routes/guards/claimantResponseCheckYourAnswersGuard', () => ({
  claimantResponsecheckYourAnswersGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
jest.spyOn(CivilServiceClient.prototype, 'getClaimAmountFee').mockImplementation(() => Promise.resolve(0));

const mockOutstandingClaimantResponseTasks =
  outstandingClaimantResponseTasks as jest.Mock;
mockOutstandingClaimantResponseTasks.mockImplementation(() => {
  const outstandingTaskList: Task[] = [];
  return outstandingTaskList;
});

describe('Claimant Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';
  const mockClaimFee = 50;

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
    (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data));
    (CivilServiceClient.prototype.getClaimAmountFee as jest.Mock).mockResolvedValueOnce(mockClaimFee);
  });

  describe('Get', () => {

    it('should return check answers page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      const res = await request(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(checkYourAnswerEng);
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const res = await request(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    it('should pass english translation via query', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      await session(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });

    it('should pass cy translation via query', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      await session(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });
  });

  describe('on Post', () => {
    it('should return errors when form is incomplete', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data));
      const data = {isClaimantRejectedDefendantOffer: 'true'};
      await request(app)
        .post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Tell us if you believe the hearing requirement details on this page are true');
        });
    });

    it('should return 500 when error in service', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data));
      const data = {isClaimantRejectedDefendantOffer: 'true'};
      await request(app)
        .post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
