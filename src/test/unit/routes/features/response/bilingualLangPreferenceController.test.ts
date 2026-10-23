import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

describe('Bilingual language preference', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (responseDraftStoreService.createOrLoadResponse as jest.Mock).mockResolvedValue({
      claimResponse: Object.assign(new CivilClaimResponse(), {id: 'draft-123', case_data: new Claim()}),
      rawResponse: {draftId: 'draft-123', payload: {}},
      isNew: false,
      createdAt: '',
      updatedAt: '',
      expiresAt: '',
    });
    (responseDraftStoreService.getResponseDraft as jest.Mock).mockResolvedValue({
      claimResponse: Object.assign(new CivilClaimResponse(), {id: 'draft-123', case_data: new Claim()}),
      rawResponse: {draftId: 'draft-123', payload: {}},
      createdAt: '',
      updatedAt: '',
      expiresAt: '',
    });
    (responseDraftStoreService.updateResponseDraft as jest.Mock).mockResolvedValue({});
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
      (responseDraftStoreService.createOrLoadResponse as jest.Mock).mockRejectedValueOnce(new Error('load failed'));
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
          expect(res.text).toContain(t('ERRORS.RESPONSE_LANGUAGE_REQUIRED'));
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
          const languageCookies = ([] as string[]).concat(res.headers['set-cookie'] || []).filter((cookie: string) => cookie.startsWith('lang='));
          expect(languageCookies.length).toBeGreaterThan(0);
          languageCookies.forEach((cookie: string) => expect(cookie).toMatch(/; Secure(?:;|$)/));
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
          const languageCookies = ([] as string[]).concat(res.headers['set-cookie'] || []).filter((cookie: string) => cookie.startsWith('lang='));
          expect(languageCookies.length).toBeGreaterThan(0);
          languageCookies.forEach((cookie: string) => expect(cookie).toMatch(/; Secure(?:;|$)/));
        });
    });

    it('should return status 500 when there is error wiht bilingual language preference set to ENGLISH', async () => {
      (responseDraftStoreService.updateResponseDraft as jest.Mock).mockRejectedValueOnce(new Error('save failed'));
      await request(app)
        .post(BILINGUAL_LANGUAGE_PREFERENCE_URL)
        .send({option: ClaimBilingualLanguagePreference.ENGLISH})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return status 500 when there is error wiht bilingual language preference set to WELSH_AND_ENGLISH', async () => {
      (responseDraftStoreService.updateResponseDraft as jest.Mock).mockRejectedValueOnce(new Error('save failed'));
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
