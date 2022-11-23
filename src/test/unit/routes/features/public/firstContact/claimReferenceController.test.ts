import request from 'supertest';
import {app} from 'app';
import nock from 'nock';
import config from 'config';
import {
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
  FIRST_CONTACT_PIN_URL,
} from 'routes/urls';
import { t } from 'i18next';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Respond to Claim - Claim Reference Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const validClaimNumberV1 = '123MC123';

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {
      await request(app)
        .get(FIRST_CONTACT_CLAIM_REFERENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
        });
    });

    it('should render with set cookie value', async () => {
      app.request['cookies'] = {'firstContact': {claimReference: validClaimNumberV1}};
      await request(app).get(FIRST_CONTACT_CLAIM_REFERENCE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
      });
    });

    it('should render with not cookie value', async () => {
      app.request['cookies'] = {'firstContact': {foo: 'blah'}};
      await request(app).get(FIRST_CONTACT_CLAIM_REFERENCE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
      });
    });
  });

  describe('on POST', () => {
    it('should information about claim reference page', async () => {
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
      });
    });

    it('should redirect and set cookie value', async () => {
      app.request.cookies = {firstContact: {foo: 'blah'}};
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_PIN_URL);
        expect(app.request.cookies.firstContact.claimReference).toBe(validClaimNumberV1);
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', claimReference: validClaimNumberV1}};
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
