import request from 'supertest';
import {app} from '../../../../../../main/app';

import {
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
  DASHBOARD_URL,
  FIRST_CONTACT_PIN_URL,
} from '../../../../../../main/routes/urls';
import { t } from 'i18next';
import { Session } from 'express-session';
import { AppSession } from 'common/models/AppRequest';
import nock from 'nock';
import config from 'config';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Respond to Claim - Claim Reference Controller', () => {
  const validClaimNumberV1 = '123JE123';
  const validClaimNumberV2 = '123DC123';
  const civilServiceUrl = config.get<string>('services.civilService.url');

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
      app.request['session'] = { 'firstContact': { claimReference: validClaimNumberV1 } } as unknown as Session;
      await request(app).get(FIRST_CONTACT_CLAIM_REFERENCE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
      });
    });

    it('should render with not cookie value', async () => {
      app.request['session'] = { 'firstContact': { foo: 'blah' } } as unknown as Session;
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
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV2}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_PIN_URL);
        expect((app.request.session as AppSession).firstContact.claimReference).toBe(validClaimNumberV2);
      });
    });

    it('should redirect and set cookie value when case is already linked', async () => {
      app.request.cookies = {firstContact: {foo: 'blah'}};
      nock(civilServiceUrl)
        .get('/assignment/reference/' + validClaimNumberV1 + '/defendant-link-status')
        .reply(200, 'true');
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(DASHBOARD_URL);
        expect((app.request.session as AppSession).firstContact.claimReference).toBe(validClaimNumberV1);
      });
    });

    it('should redirect and set cookie value when case is not linked', async () => {
      app.request.cookies = {firstContact: {foo: 'blah'}};
      nock(civilServiceUrl)
        .get('/assignment/reference/' + validClaimNumberV1 + '/defendant-link-status')
        .reply(200, 'false');
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_PIN_URL);
        expect((app.request.session as AppSession).firstContact.claimReference).toBe(validClaimNumberV1);
      });
    });

    it('should redirect and set cookie value for Civil case when case is already linked', async () => {
      app.request.cookies = {firstContact: {foo: 'blah'}};
      nock(civilServiceUrl)
        .get('/assignment/reference/' + validClaimNumberV1 + '/defendant-link-status')
        .reply(200, 'true');
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(DASHBOARD_URL);
        expect((app.request.session as AppSession).firstContact.claimReference).toBe(validClaimNumberV1);
      });
    });

    it('should redirect and set cookie value for Civil case when case is not linked', async () => {
      app.request.cookies = {firstContact: {foo: 'blah'}};
      nock(civilServiceUrl)
        .get('/assignment/reference/' + validClaimNumberV1 + '/defendant-link-status')
        .reply(200, 'false');
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV1}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_PIN_URL);
        expect((app.request.session as AppSession).firstContact.claimReference).toBe(validClaimNumberV1);
      });
    });

    it('should redirect and update cookie value', async () => {
      app.request.cookies = {eligibility: {foo: 'blah', claimReference: validClaimNumberV2}};
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: validClaimNumberV2}).expect((res) => {
        expect(res.status).toBe(302);
        expect(app.request.cookies.eligibility.foo).toBe('blah');
      });
    });
  });
});
