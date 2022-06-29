import nock from 'nock';
import config from 'config';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as taskListService from '../../../../../main/services/features/response/taskListService';
import {RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {TaskStatus} from '../../../../../main/common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/response/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/response/taskListService');
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockOutstandingTasksFromCase = taskListService.outstandingTasksFromCase as jest.Mock;

const CLAIM_ID = 'aaa';
const TASK_DESCRIPTION = 'Task description';
const TASK_URL = 'Task URL';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_INCOMPLETE_SUBMISSION_URL);

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    it('should return incomplete submission page', async () => {

      mockOutstandingTasksFromCase.mockImplementation(() => [
        {
          description: TASK_DESCRIPTION,
          status: TaskStatus.INCOMPLETE,
          url: TASK_URL,
        },
      ]);

      const response = await request(app).get(respondentIncompleteSubmissionUrl);
      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;


      const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
      const bulletPoints = getElementsByXPath(
        "//ul[@class='govuk-list govuk-list--bullet']/li",
        htmlDocument);

      expect(header.length).toBe(1);
      expect(header[0].textContent).toBe('You need to complete all sections before you submit your response');
      expect(bulletPoints.length).toBe(1);
      expect(bulletPoints[0].textContent?.trim()).toBe(TASK_DESCRIPTION);
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseDataFromStore.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(respondentIncompleteSubmissionUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
