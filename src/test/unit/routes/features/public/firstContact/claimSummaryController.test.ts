
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {mockCivilClaimWithTimelineAndEvidence, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from '../../../../../../main/routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { Session } from 'express-session';
import {t} from 'i18next';
import nock from 'nock';
import config from 'config';

const civilServiceUrl = config.get<string>('services.civilService.url');

describe('First contact - claim summary controller', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });
  it('should render page successfully if cookie has correct values', async () => {
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .times(2)
      .reply(200, '0');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .times(2)
      .reply(200, '0');
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_SUMMARY.PAGE_TITLE'));
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(FIRST_CONTACT_CLAIM_SUMMARY_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
      });
  });

  it('should redirect to access denied page if cookie is missing pinVerified property', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404' } } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property', async () => {
    app.request['session'] = { 'firstContact': { pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property and pinVerified is no', async () => {
    app.request['session'] = { 'firstContact': { pin: YesNo.NO } } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie pinVerified value is no', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: YesNo.NO } } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if firstContact cookie is not empty', async () => {
    app.request['session'] = { 'firstContact': {} } as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing', async () => {
    app.request['session'] = {} as unknown as Session;
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });
});
