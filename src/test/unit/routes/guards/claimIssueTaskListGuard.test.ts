import {getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import request from 'supertest';
import {
  BASE_ELIGIBILITY_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

describe('Claim Issue TaskList Guard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    jest.resetAllMocks();
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should redirect if draft claim has no case_data and eligibility not completed', async () => {
    //Given
    (getDraftClaimFromStore as jest.Mock).mockResolvedValue({});
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('should redirect if claim not exists and eligibility not completed', async () => {
    //Given
    (getDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('should access to claim/task-list page when claim exist', async () => {
    //Given
    (getDraftClaimFromStore as jest.Mock).mockResolvedValue({case_data: {}});
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should access to claim/task-list page when eligibility questions completed', async () => {
    //Given
    (getDraftClaimFromStore as jest.Mock).mockResolvedValue({case_data: {}});
    app.request.cookies = {eligibilityCompleted: true};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should access to claim/task-list page when eligibility question completed and claim exist', async () => {
    //Given
    (getDraftClaimFromStore as jest.Mock).mockResolvedValue({case_data: {}});
    app.request.cookies = {eligibilityCompleted: true};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
});
