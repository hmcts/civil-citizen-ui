import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_PENSION_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_DEPENDANTS_URL,
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

describe('Partner Age', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen partner age page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is your partner aged 18 or over?');
        });
    });
    test('should return error when cannot read age option of undefined', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => {throw new Error('Redis DraftStore failure.');})};
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: 'Error: Redis DraftStore failure.'});
        });
    });
  });
  test('should return error on incorrect input', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_PARTNER_AGE_URL)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Choose option: Yes or No');
      });
  });

  test('should redirect page when "yes"', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_PARTNER_AGE_URL)
      .send('option=yes')
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CITIZEN_PARTNER_PENSION_URL);
      });
  });

  describe('on POST', () => {
    test('should redirect page when "no" and defendant disabled = YES', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
  });

  describe('on POST', () => {
    test('should redirect page when "no" and defendant disabled = NO', async () => {
      civilClaimResponseMock.case_data.statementOfMeans.disability.option = 'no';
      const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(civilClaimResponse)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
  });

  describe('on GET', () => {
    test('should show partner age page when haven´t statementOfMeans', async () => {

      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
});
