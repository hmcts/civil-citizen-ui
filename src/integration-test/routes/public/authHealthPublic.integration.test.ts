import request from 'supertest';
import express from 'express';
import session from 'express-session';
import nock from 'nock';
process.env.NODE_ENV = 'test';
import '../../setup/sharedMocks';
import {launchDarklyClientMock} from '../../setup/sharedMocks';
import {app} from '../../../main/app';
import {
  ACCESSIBILITY_STATEMENT_URL,
  CONTACT_US_URL,
  COOKIES_URL,
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
  FIRST_CONTACT_SIGNPOSTING_URL,
  PRIVACY_POLICY_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  TERMS_AND_CONDITIONS_URL,
} from '../../../main/routes/urls';

const HMCTS_ACCESS_URL = 'http://localhost:9002';

const {OidcMiddleware} = jest.requireActual('../../../main/modules/oidc') as {
  OidcMiddleware: new () => {enableFor: (application: express.Application) => void};
};

const authApp = express();
authApp.use(session({secret: 'auth-health-public', resave: false, saveUninitialized: true}));
new OidcMiddleware().enableFor(authApp);
authApp.get('/private', (_req, res) => {
  res.status(200).send('private');
});
authApp.get(FIRST_CONTACT_SIGNPOSTING_URL, (_req, res) => {
  res.status(200).send('public');
});

describe('Integration: auth, health and public pages', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    launchDarklyClientMock.isHmctsAccessMigrationEnabled.mockResolvedValue(false);
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it('reports UP when the draft store responds', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
    expect(response.body['hmcts-access'].status).toBe('UP');
  });

  it('reports DOWN when the draft store ping fails', async () => {
    app.locals.draftStoreClient.ping.mockRejectedValue(new Error('redis down'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('DOWN');
  });

  it('reports DOWN when the HMCTS Access sign-in probe fails', async () => {
    launchDarklyClientMock.isHmctsAccessMigrationEnabled.mockResolvedValue(true);
    nock(HMCTS_ACCESS_URL).get('/health').reply(500);

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('DOWN');
    expect(response.body['hmcts-access'].status).toBe('DOWN');
  });

  it('renders the public pages without sending the user to sign in', async () => {
    const pages = [
      {url: PRIVACY_POLICY_URL, text: 'Privacy policy'},
      {url: TERMS_AND_CONDITIONS_URL, text: 'Terms and conditions'},
      {url: COOKIES_URL, text: 'Cookies'},
      {url: CONTACT_US_URL, text: 'Contact us'},
      {url: ACCESSIBILITY_STATEMENT_URL, text: 'Accessibility statement for the Online Civil Money Claims service'},
      {url: FIRST_CONTACT_SIGNPOSTING_URL, text: 'Respond to a money claim'},
    ];

    for (const page of pages) {
      const response = await request(app).get(page.url);
      expect(response.status).toBe(200);
      expect(response.text).toContain(page.text);
      expect(response.header.location).toBeUndefined();
    }
  });

  it('renders the privacy policy in Welsh when lang is cy', async () => {
    const response = await request(app).get(`${PRIVACY_POLICY_URL}?lang=cy`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Polisi preifatrwydd');
  });

  it('saves cookie preferences', async () => {
    const response = await request(app).post(COOKIES_URL).send({analytics: 'off', apm: 'off'});

    expect(response.status).toBe(200);
    expect(response.text).toContain('Your cookie settings were saved');
  });

  it('shows a validation error when the claim number is left blank', async () => {
    const response = await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL).send({claimReferenceValue: ''});

    expect(response.status).toBe(200);
    expect(response.text).toContain('Enter your claim number');
    expect(response.text).toContain('Enter your valid claim number');
  });

  it('redirects sign-in and sign-out through IDAM and leaves first contact open', async () => {
    const signIn = await request(authApp).get(SIGN_IN_URL);
    expect(signIn.status).toBe(302);
    expect(signIn.header.location).toContain('client_id=');
    expect(signIn.header.location).toContain('response_type=code');

    const signOut = await request(authApp).get(SIGN_OUT_URL);
    expect(signOut.status).toBe(302);
    expect(signOut.header.location).toContain('http://localhost:9002/o/endSession');

    const protectedPage = await request(authApp).get('/private');
    expect(protectedPage.status).toBe(302);
    expect(protectedPage.header.location).toBe(SIGN_IN_URL);

    const publicPage = await request(authApp).get(FIRST_CONTACT_SIGNPOSTING_URL);
    expect(publicPage.status).toBe(200);
    expect(publicPage.text).toBe('public');
  });
});
