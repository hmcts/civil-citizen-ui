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
import * as utilityService from 'modules/utilityService';
import {
  deleteResponseDraft,
  getResponseClaimById,
  getResponseDraft,
} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {Party} from 'common/models/party';
import {PartyType} from 'common/models/partyType';
import {Email} from 'common/models/Email';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import * as submitResponseModule from 'services/features/response/submission/submitResponse';

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const civilServiceUrl = config.get<string>('services.civilService.url');
const data = require('../../../../utils/mocks/defendantClaimsMock.json');

jest.mock('axios');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/response/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/services/features/common/responseDeadlineAgreedService');
jest.mock('../../../../../main/services/features/response/submission/submitResponse');
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
const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockDeleteResponseDraft = deleteResponseDraft as jest.Mock;
const mockSubmitResponse = submitResponseModule.submitResponse as jest.Mock;
mockRejectingFullAmount.mockImplementation(() => true);

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = '1645882162449409';
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
mockClaimWithPcqId.respondentResponsePcqId = '123';

const mockDraftResult = {
  claimResponse: {id: 'draft-123', case_data: mockClaimWithPcqId},
  rawResponse: {draftId: 'draft-123', payload: mockClaimWithPcqId},
  createdAt: '',
  updatedAt: '',
  expiresAt: '',
};

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(mockClaimWithPcqId);
    mockGetResponseDraft.mockResolvedValue(mockDraftResult);
    mockDeleteResponseDraft.mockResolvedValue(undefined);
    mockSaveStatementOfTruth.mockResolvedValue(undefined);
    mockSubmitResponse.mockResolvedValue(mockClaimWithPcqId);
    mockRejectingFullAmount.mockImplementation(() => true);
  });

  describe('on GET', () => {
    beforeEach((done) => {
      jest.spyOn(utilityService, 'getClaimById').mockResolvedValue(mockClaimWithPcqId);
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
      await session(app).get(respondentCheckAnswersUrl)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });

    it('should pass cy translation via query', async () => {
      await session(app).get(respondentCheckAnswersUrl)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });

    it('should redirect to PCQ jouney', async () => {
      isPcqShutterOnMock.mockResolvedValue(false);
      axios.get = jest.fn().mockResolvedValue({data: {status: 'UP'}});
      const mockClaimToRedirectToPcq = new Claim();
      mockClaimToRedirectToPcq.respondent1 = new Party();
      mockClaimToRedirectToPcq.respondent1.type = PartyType.INDIVIDUAL;
      mockClaimToRedirectToPcq.respondent1.emailAddress = new Email('test@test.com');
      jest.spyOn(utilityService, 'getClaimById').mockResolvedValue(mockClaimToRedirectToPcq);

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
      const claimWithDq = Object.assign(new Claim(), mockClaimWithPcqId);
      claimWithDq.directionQuestionnaire = new DirectionQuestionnaire();
      claimWithDq.directionQuestionnaire.hearing = new Hearing();
      mockGetResponseClaimById.mockResolvedValue(claimWithDq);

      const data = {signed: ''};
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
          expect(res.text).toContain('Select a court');
          expect(res.text).toContain('Tell us why you want the hearing to be held at this court');
        });
      expect(mockDeleteResponseDraft).not.toHaveBeenCalled();
    });

    it('should save, submit and delete the response draft on successful post', async () => {
      mockGetSummarySections.mockImplementation(() => createClaimWithBasicRespondentDetails());
      mockGetResponseClaimById.mockResolvedValue(mockClaimWithPcqId);

      const data = {
        signed: 'true',
        type: 'basic',
        isFullAmountRejected: 'false',
        directionsQuestionnaireSigned: 'true',
      };
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(302);
        });

      expect(mockSaveStatementOfTruth).toHaveBeenCalledWith(
        expect.anything(),
        CLAIM_ID,
        expect.anything(),
      );
      expect(mockGetResponseDraft).toHaveBeenCalled();
      expect(mockSubmitResponse).toHaveBeenCalled();
      expect(mockDeleteResponseDraft).toHaveBeenCalledWith(
        expect.anything(),
        CLAIM_ID,
        'draft-123',
      );
    });

    it('should return 500 when error in service', async () => {
      mockGetResponseClaimById.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
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
