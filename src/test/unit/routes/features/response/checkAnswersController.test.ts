import nock from 'nock';
import config from 'config';
import Module from 'module';
import axios from 'axios';
import {
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/response/checkAnswers/checkAnswersService';
import {CITIZEN_DETAILS_URL, RESPONSE_TASK_LIST_URL, RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from 'models/summaryList/summarySections';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isFullAmountReject} from 'modules/claimDetailsService';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {isPcqShutterOn} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import {Party} from 'common/models/party';
import {PartyType} from 'common/models/partyType';
import {Email} from 'common/models/Email';

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('axios');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/response/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/services/features/common/responseDeadlineAgreedService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/services/features/common/taskListService', () => ({
  ...jest.requireActual('../../../../../main/services/features/common/taskListService') as Module,
  getTaskLists: jest.fn(() => TASK_LISTS),
}));

const isPcqShutterOnMock = isPcqShutterOn as jest.Mock;
const mockGetSummarySections = getSummarySections as jest.Mock;
const mockSaveStatementOfTruth = saveStatementOfTruth as jest.Mock;
const mockRejectingFullAmount = isFullAmountReject as jest.Mock;
const mockSetResponseDeadline = setResponseDeadline as jest.Mock;
mockRejectingFullAmount.mockImplementation(() => true);
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = 'aaa';
export const TASK_LISTS = [
  {
    title: 'Task List',
    tasks: [
      {
        description: 'Task 1',
        status: TaskStatus.COMPLETE,
        url: 'some URL',
      },
    ],
  },
];
const respondentCheckAnswersUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_CHECK_ANSWERS_URL);

const mockClaimWithPcqId = new Claim();
mockClaimWithPcqId.pcqId = '123';

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';

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
    mockSetResponseDeadline.mockImplementation(async () => {
      return new Date();
    });
  });

  describe('on GET', () => {
    beforeEach((done) => {
      jest.spyOn(utilityService, 'getClaimById').mockResolvedValue(mockClaimWithPcqId);
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaimWithPcqId;
      });
      session(app)
        .get(constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_TASK_LIST_URL))
        .expect(200)
        .end(function (err: Error) {
          if (err) {
            return done(err);
          }
          return done();
        });
    });

    it('should pass english translation via query', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaimWithPcqId;
      });
      await session(app).get(respondentCheckAnswersUrl)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    it('should pass cy translation via query', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockClaimWithPcqId;
      });
      await session(app).get(respondentCheckAnswersUrl)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });
    it('should redirect to PCQ jouney', async () => {
      isPcqShutterOnMock.mockResolvedValue(false);
      axios.get = jest.fn().mockResolvedValue({ data: { status: 'UP' } });
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const mockClaimToRedirectToPcq = new Claim();
        mockClaimToRedirectToPcq.respondent1 = new Party();
        mockClaimToRedirectToPcq.respondent1.type = PartyType.INDIVIDUAL;
        mockClaimToRedirectToPcq.respondent1.emailAddress = new Email('test@test.com');
        return mockClaimToRedirectToPcq;
      });

      await session(app).get(respondentCheckAnswersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await session(app)
        .get(respondentCheckAnswersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return errors when form is incomplete', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicRespondentDetails();
      });
      const data = {signed: ''};
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
        });
    });
    it('should return 500 when error in service', async () => {
      mockSaveStatementOfTruth.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const data = {signed: 'true'};
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

export function createClaimWithBasicRespondentDetails(): SummarySections {
  return {
    sections: [{
      title: 'Your details',
      summaryList: {
        rows: [
          {
            key: {
              text: 'Full name',
            },
            value: {
              text: PARTY_NAME,
            },
            actions: {
              items: [{
                href: constructResponseUrlWithIdParams(CLAIM_ID, CITIZEN_DETAILS_URL),
                text: 'Change',
              }],
            },
          },
        ],
      },
    }],
  };
}
