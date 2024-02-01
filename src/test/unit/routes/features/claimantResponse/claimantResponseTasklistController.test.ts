import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {app} from '../../../../../main/app';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  mockCivilClaimClaimantIntention,
  mockCivilClaimClaimantIntentionNotSettle,
  mockRedisFailure
} from '../../../../utils/mockDraftStore';
import {configureSpy} from '../../../../utils/spyConfiguration';
import * as carmToggleUtils from 'common/utils/carmToggleUtils';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(carmToggleUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

describe('Claimant response task list', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should display task list', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;

      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).toContain('Submit');

        });
    });

    it('should display task list carm not enabled', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;
      isCarmEnabledSpy(false);
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).not.toContain('Mediation');
          expect(res.text).toContain('Submit');

        });
    });

    it('should display task list claimant proceeds carm enabled', async () => {
      isCarmEnabledSpy(true);
      app.locals.draftStoreClient = mockCivilClaimClaimantIntentionNotSettle;
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).toContain('Mediation');
          expect(res.text).toContain('Submit');

        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
