import nock from 'nock';
import config from 'config';
import Module from 'module';
import * as checkAnswersService from '../../../../../main/services/features/response/checkAnswersService';
import {CITIZEN_DETAILS_URL, CLAIM_TASK_LIST_URL, RESPONSE_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {TaskStatus} from '../../../../../main/common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const testSession = session(app);

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/response/checkAnswersService');
jest.mock('../../../../../main/services/features/response/taskListService', () => ({
  ...jest.requireActual('../../../../../main/services/features/response/taskListService') as Module,
  getTaskLists: jest.fn(() => TASK_LISTS),
}));
const mockGetSummarySections = checkAnswersService.getSummarySections as jest.Mock;
const mockSaveStatementOfTruth = checkAnswersService.saveStatementOfTruth as jest.Mock;

const PARTY_NAME = 'Mrs. Mary Richards';
const CLAIM_ID = 'aaa';
const TASK_LISTS = [
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

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const checkYourAnswerEng = 'Check your answers';
  const checkYourAnswerCy = 'Gwiriwch eich ateb';
  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockGetSummarySections.mockImplementation(() => {
      return createClaimWithBasicRespondentDetails();
    });
  });

  describe('on GET', () => {

    beforeEach(function (done) {

      testSession
        .get(constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_TASK_LIST_URL))
        .expect(200)
        .end(function (err: Error) {
          if (err) {
            return done(err);
          }
          return done();
        });
    });

    it('should return check answers page', async () => {
      mockGetSummarySections.mockImplementation(() => {
        return createClaimWithBasicRespondentDetails();
      });

      const response = await testSession.get(respondentCheckAnswersUrl);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const fullName = getElementsByXPath(
        "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Full name')]]",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe(checkYourAnswerEng);
      expect(fullName.length).toBe(1);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);

    });
    test('should pass english translation via query', async () => {
      await testSession.get(respondentCheckAnswersUrl)
        .query({lang: 'en'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerEng);
        });
    });
    test('should pass cy translation via query', async () => {
      await testSession.get(respondentCheckAnswersUrl)
        .query({lang: 'cy'})
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(checkYourAnswerCy);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await testSession
        .get(respondentCheckAnswersUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
  describe('on Post', () => {
    test('should return errors when form is incomplete', async () => {
      const data = {signed: ''};
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
        });
    });
    test('should return 500 when error in service', async () => {
      mockSaveStatementOfTruth.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const data = {signed: 'true'};
      await request(app)
        .post(respondentCheckAnswersUrl)
        .send(data)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});

function createClaimWithBasicRespondentDetails(): SummarySections {
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
