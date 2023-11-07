import nock from 'nock';
import config from 'config';
import {outstandingClaimantResponseTasks} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL} from 'routes/urls';
import {getElementsByXPath} from '../../../../utils/xpathExtractor';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import { Claim } from 'common/models/claim';
import { CaseState } from 'common/form/models/claimDetails';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const request = require('supertest');
const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const mockOutstandingClaimantResponseTasks =
  outstandingClaimantResponseTasks as jest.Mock;
const mockClaim = getClaimById as jest.Mock;

const CLAIM_ID = 'aaa';
const TASK_DESCRIPTION = 'Task description';
const TASK_URL = 'Task URL';
const incompleteSubmissionUrl = constructResponseUrlWithIdParams(CLAIM_ID, CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL);

describe("on GET should display incomplete submission page", () => {
  const citizenRoleToken: string = config.get("citizenRoleToken");
  const idamServiceUrl: string = config.get("services.idam.url");

  beforeAll(() => {
    nock(idamServiceUrl)
      .post("/o/token")
      .reply(200, { id_token: citizenRoleToken });
  });

  it("should return incomplete submission page", async () => {
    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.id = CLAIM_ID;
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      return claim;
    });

    mockOutstandingClaimantResponseTasks.mockImplementation(() => [
      {
        description: TASK_DESCRIPTION,
        status: TaskStatus.INCOMPLETE,
        url: TASK_URL,
      },
    ]);

    const response = await request(app).get(incompleteSubmissionUrl);
    expect(response.status).toBe(200);

    const dom = new JSDOM(response.text);
    const htmlDocument = dom.window.document;
    const header = getElementsByXPath(
      "//h1[@class='govuk-heading-l']",
      htmlDocument
    );
    const bulletPoints = getElementsByXPath(
      "//ul[@class='govuk-list govuk-list--bullet']/li",
      htmlDocument
    );

    expect(header.length).toBe(1);
    expect(header[0].textContent).toBe("You need to complete all sections before you submit your response");
    expect(bulletPoints.length).toBe(1);
    expect(bulletPoints[0].textContent?.trim()).toBe(TASK_DESCRIPTION);
  });
});
