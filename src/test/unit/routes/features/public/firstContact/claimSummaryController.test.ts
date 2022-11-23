import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from 'app';
import {YesNo} from 'common/form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaimWithTimelineAndEvidence, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from 'routes/urls';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('First contact - claim summary controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully if cookie has correct values', async () => {
    app.request['cookies'] = {'firstContact': {claimId: '1645882162449404', pinVerified: YesNo.YES}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim details');
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.request['cookies'] = {'firstContact': {claimId: '1645882162449404', pinVerified: YesNo.YES}};
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(FIRST_CONTACT_CLAIM_SUMMARY_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should redirect to access denied page if cookie is missing pinVerified property', async () => {
    app.request['cookies'] = {'firstContact': {claimId: '1645882162449404'}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property', async () => {
    app.request['cookies'] = {'firstContact': {pinVerified: YesNo.YES}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property and pinVerified is no', async () => {
    app.request['cookies'] = {'firstContact': {pinVerified: YesNo.NO}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie pinVerified value is no', async () => {
    app.request['cookies'] = {'firstContact': {claimId: '1645882162449404', pinVerified: YesNo.NO}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if firstContact cookie is not empty', async () => {
    app.request['cookies'] = {'firstContact': {}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing', async () => {
    app.request['cookies'] = {};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });
});
