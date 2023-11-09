import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('Bilingual language preference', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on bilingual language preference page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.BILINGUAL_LANGUAGE_PREFERENCE.DESCRIPTION_1'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return errors when option is not selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_WELSH_AND_ENGLISH_OPTION'));
        });
    });

    it('should redirect with bilingual language preference set to ENGLISH and redirect to task list', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.ENGLISH})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with with bilingual language preference set to WELSH_AND_ENGLISH and redirect to task list', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when there is error wiht bilingual language preference set to ENGLISH', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.ENGLISH})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when there is error wiht bilingual language preference set to WELSH_AND_ENGLISH', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
