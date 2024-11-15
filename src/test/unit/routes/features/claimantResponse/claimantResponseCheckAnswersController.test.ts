import nock from 'nock';
import config from 'config';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaimantIntention, mockRedisFailure} from '../../../../utils/mockDraftStore';
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
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
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
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data));
      const res = await request(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(checkYourAnswerEng);
    });

    it('should return http 500 when has error in the get method', async () => {
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    it('should pass english translation via query', async () => {
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      await session(app).get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });

    it('should pass cy translation via query', async () => {
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      (getClaimById as jest.Mock).mockResolvedValueOnce(Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data));
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
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      const claim = Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      const data = {isClaimantRejectedDefendantOffer: 'true'};
      await request(app)
        .post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Tell us if you believe the hearing requirement details on this page are true');
          expect(res.text).toContain('Select a court');
          expect(res.text).toContain('Tell us why you want the hearing to be held at this court');
        });
    });

    it('should return 500 when error in service', async () => {
      (getClaimById as jest.Mock).mockClear();
      app.locals.draftStoreClient = mockRedisFailure;
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
