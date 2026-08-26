import nock from 'nock';
import config from 'config';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {outstandingTasksFromCase} from 'services/features/claim/taskListService';
import {CLAIM_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/claim/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../main/services/features/claim/taskListService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockOutstandingTasksFromCase = outstandingTasksFromCase as jest.Mock;

const CLAIM_ID = 'aaa';
const TASK_DESCRIPTION = 'Task description';
const TASK_URL = 'Task URL';
const respondentIncompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_INCOMPLETE_SUBMISSION_URL);

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: CLAIM_ID,
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: CLAIM_ID,
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Response - Check answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return incomplete submission page', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
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

    it('should return status 500 when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);
      await request(app)
        .get(respondentIncompleteSubmissionUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(respondentIncompleteSubmissionUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
