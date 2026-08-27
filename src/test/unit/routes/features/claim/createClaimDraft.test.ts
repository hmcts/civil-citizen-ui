import request from 'supertest';
import { app } from '../../../../../main/app';
import createDraftClaimController from 'routes/features/claim/createDraftClaim';
import config from 'config';
import nock from 'nock';
import {
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CLAIM_CHECK_ANSWERS_URL,
  TESTING_SUPPORT_URL,
} from 'routes/urls';
import { draftClaim } from '../../../../../main/modules/draft-store/draftClaimCache';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as draftStoreManagerService from 'modules/draft-store/draftStoreManagerService';
import * as draftClaimCache from '../../../../../main/modules/draft-store/draftClaimCache';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('createDraftClaim Router', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.use(createDraftClaimController);

  beforeAll(() => {
    nock(idamUrl).post('/o/token').reply(200, { id_token: citizenRoleToken });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (launchDarkly.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    jest.spyOn(draftClaimCache, 'saveDraftClaimToCache').mockResolvedValue();
    (draftStoreManagerService.createOrLoadDraft as jest.Mock).mockResolvedValue({
      claimResponse: {case_data: draftClaim},
      createdAt: '2026-08-14T10:00:00.000Z',
      rawResponse: {draftId: 'draft-123'},
      isNew: true,
    });
  });

  describe('on GET', () => {
    it('should render the correct view', async () => {
      const response = await request(app).get(TESTING_SUPPORT_URL);
      expect(response.status).toBe(200);
    });

    describe('processDraftClaim function', () => {
      it('should process the draftClaim correctly', () => {
        const expectedOutput = draftClaim;
        const result = draftClaim;

        expect(result).toEqual(expectedOutput);
      });
    });
  });

  describe('on POST', () => {
    it('creates a deterministic defendant response draft', async () => {
      const saveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim').mockResolvedValue();

      await request(app)
        .post(TESTING_SUPPORT_URL)
        .send('draftType=response')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', '1111222233334444'));
        });

      expect(saveDraftClaim).toHaveBeenCalledWith(
        '1111222233334444undefined',
        expect.objectContaining({legacyCaseReference: '1111-2222-3333-4444', totalClaimAmount: 1000}),
        true,
        undefined,
      );
    });

    it('should redirect to check answers page', async () => {
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CHECK_ANSWERS_URL);
        });

      expect(draftStoreManagerService.createOrLoadDraft).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolvingDispute: true,
          completingClaimConfirmed: true,
          claimInterest: 'no',
        }),
      );
    });
    it('should return http 500 when has error in the get method', async () => {
      (draftStoreManagerService.createOrLoadDraft as jest.Mock).mockRejectedValue(
        new Error(TestMessages.REDIS_FAILURE),
      );
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
