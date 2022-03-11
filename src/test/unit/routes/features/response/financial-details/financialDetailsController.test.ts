import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  BASE_CASE_RESPONSE_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CLAIM_TASK_LIST,
  FINANCIAL_DETAILS,
} from '../../../../../../main/routes/urls';



const claimIndividualMock = require('./claimIndividualMock.json');
const claimOrganisationMock = require('./claimOrganisationMock.json');
const claimIndividual: string = JSON.stringify(claimIndividualMock);
const claimOrganisation: string = JSON.stringify(claimOrganisationMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(claimIndividual)),
};

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Citizen financial details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:3001')
      .post(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL)
      .reply(200, {});
    nock('http://localhost:3001')
      .post(BASE_CASE_RESPONSE_URL + CLAIM_TASK_LIST)
      .reply(200, {});
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('on GET', () => {
    test('should return individual financial details page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS)
        .set('id', '1646818997929180')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('details of your finances');
        });
    });
    test('should return organisation financial details page', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS)
        .set('id', '1646768947464020')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('your company or organisation&#39;s most recent statement of accounts');
        });
    });
  });


  describe('on POST', () => {
    test('should redirect for individual',  async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividual)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS)
        .set('id', '1646818997929180')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain('case/:id/response/statement-of-means/bank-accounts');
        });
    });
    test('should redirect for organisation',  async() => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS)
        .set('id', '1646768947464020')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain('/case/:id/response/claim-task-list');
        });
    });
    test('should log error for no counterpartyType', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(BASE_CASE_RESPONSE_URL + FINANCIAL_DETAILS)
        .send({counterpartyType: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });
});
