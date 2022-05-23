import nock from 'nock';
import config from 'config';
import * as checkAnswersService from '../../../../../main/services/features/response/checkAnswersService';
import * as taskListService from '../../../../../main/modules/taskListService';
import {
  CITIZEN_DETAILS_URL,
  CLAIM_TASK_LIST_URL,
  RESPONSE_CHECK_ANSWERS_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {TaskStatus} from '../../../../../main/common/models/taskList/TaskStatus';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;


const request = require('supertest');
const {app} = require('../../../../../main/app');
const session = require('supertest-session');
const testSession = session(app);

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/response/checkAnswersService');
jest.mock('../../../../../main/modules/taskListService');
const mockGetSummarySections = checkAnswersService.getSummarySections as jest.Mock;
const mockGetTaskLists = taskListService.getTaskLists as jest.Mock;

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
const respondentCheckAnswersUrl = RESPONSE_CHECK_ANSWERS_URL.replace(':id', CLAIM_ID);

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    beforeEach(function (done) {
      mockGetTaskLists.mockImplementation(() => {
        return TASK_LISTS;
      });

      testSession
        .get(CLAIM_TASK_LIST_URL.replace(':id', CLAIM_ID))
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
      expect(header[0].textContent).toBe('Check your answers');
      expect(fullName.length).toBe(1);
      expect(fullName[0].textContent?.trim()).toBe(PARTY_NAME);
    });
    it('should return status 500 when error thrown', async () => {
      mockGetSummarySections.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(respondentCheckAnswersUrl)
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
                href: CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID),
                text: 'Change',
              }],
            },
          },
        ],
      },
    }],
  };
}
