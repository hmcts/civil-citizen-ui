import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import request from 'supertest';
import {
  BASE_ELIGIBILITY_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';
import {mockRedisFailure} from '../../../utils/mockDraftStore';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Claim Issue TaskList Guard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    jest.resetAllMocks();
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  it('should redirect if claim not exists and eligibility not completed', async () => {
    //Given

    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('should access to claim/task-list page when claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.id = '1';
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
  it('should access to claim/task-list  page when eligibility questions completed', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    app.request.cookies = {eligibilityCompleted: true};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
  it('should access to claim/task-list page when eligibility question completed and claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.id = '1';
    mockGetCaseData.mockImplementation(async () => mockClaim);
    app.request.cookies = {eligibilityCompleted: true};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
  it('should return 500 status code when error occurs', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL);
    expect(res.status).toBe(500);
    expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
  });

});
