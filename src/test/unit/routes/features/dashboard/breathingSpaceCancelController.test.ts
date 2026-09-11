import request from 'supertest';
import nock from 'nock';
import config from 'config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {app} from '../../../../../main/app';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_ENTER_URL,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {YesNo} from 'form/models/yesNo';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Breathing Space Cancel Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValue(new RedisStore({
      client: new Redis(),
    }));
  });

  beforeEach(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
    jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(Object.assign(new Claim(), claim.case_data, {
      breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(BreathingSpaceType.STANDARD, 'REF123'),
    }));
    jest.spyOn(draftStoreService, 'saveDraftClaim').mockResolvedValue();
    jest.spyOn(draftStoreService, 'deleteFieldDraftClaimFromStore').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render cancel confirmation page', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(BREATHING_SPACE_CANCEL_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you sure you want to exit this journey?');
        expect(res.text).toContain('All answers will be lost, and breathing space will not be applied');
        expect(res.text).toContain('Continue');
      });
  });

  it('should show error when neither yes nor no is selected', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .post(BREATHING_SPACE_CANCEL_URL)
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Choose option: Yes or No');
        expect(draftStoreService.deleteFieldDraftClaimFromStore).not.toHaveBeenCalled();
      });
  });

  it('should redirect to enter page when no is selected', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .post(BREATHING_SPACE_CANCEL_URL)
      .send({option: YesNo.NO})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain(BREATHING_SPACE_ENTER_URL);
        expect(draftStoreService.deleteFieldDraftClaimFromStore).not.toHaveBeenCalled();
      });
  });

  it('should clear draft and redirect to dashboard when yes is selected', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .post(BREATHING_SPACE_CANCEL_URL)
      .send({option: YesNo.YES})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain(DASHBOARD_CLAIMANT_URL);
        expect(draftStoreService.deleteFieldDraftClaimFromStore).toHaveBeenCalledWith(
          'redis-key',
          expect.any(Object),
          'breathingSpaceEnterDraft',
        );
      });
  });
});
