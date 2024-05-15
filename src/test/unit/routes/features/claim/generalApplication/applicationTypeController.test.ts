import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECT_TYPE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should send the value when select OTHER and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.OTHER, optionOther: ApplicationTypeOption.PROCEEDS_IN_HERITAGE})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.APPLICATION_TYPE_REQUIRED'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
