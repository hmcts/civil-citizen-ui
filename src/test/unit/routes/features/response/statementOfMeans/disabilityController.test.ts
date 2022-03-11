import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DISABILITY_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
  CITIZEN_WHERE_LIVE_URL,
} from '../../../../../../main/routes/urls';

const civilClaimResponseMock = require('./civilClaimResponseMock.json');
const noDisabilityMock = require('./noDisabilityMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noDisabilityCivilClaimResponse: string = JSON.stringify(noDisabilityMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noDisabilityCivilClaimResponse)),
};
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen disability page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you disabled?');
        });
    });
  });
  test('should return error on incorrect input', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DISABILITY_URL)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Choose option: Yes or No');
      });
  });

  test('should redirect page when "yes"', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DISABILITY_URL)
      .send('disability=yes')
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CITIZEN_SEVERELY_DISABLED_URL);
      });
  });

  describe('on POST', () => {
    test('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHERE_LIVE_URL);
        });
    });
  });

  describe('on POST', () => {
    test('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHERE_LIVE_URL);
        });
    });
  });

  describe('on GET', () => {
    test('should show disability page when haven´t statementOfMeans', async () => {

      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
});
