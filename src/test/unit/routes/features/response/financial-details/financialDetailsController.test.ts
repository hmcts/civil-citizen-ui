import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {constructResponseUrlWithIdParams} from '../../../../../../main/common/utils/urlFormatter';
import {
  setFinancialDetailsControllerLogger,
} from '../../../../../../main/routes/features/response/financialDetails/financialDetailsController';
import {LoggerInstance} from 'winston';
import {FINANCIAL_DETAILS_URL} from '../../../../../../main/routes/urls';

const claimIndividualMock = require('./claimIndividualMock.json');
const claimIndividualMockNoType = require('./claimIndividualMockNoType.json');
const claimOrganisationMock = require('./claimOrganisationMock.json');
const claimIndividual: string = JSON.stringify(claimIndividualMock);
const claimIndividualNoType: string = JSON.stringify(claimIndividualMockNoType);
const claimOrganisation: string = JSON.stringify(claimOrganisationMock);

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

let mockDraftStore = {
  set: jest.fn(() => Promise.resolve({data: {}})),
  get: jest.fn(() => Promise.resolve(claimIndividual)),
};

describe('Citizen financial details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    setFinancialDetailsControllerLogger(mockLogger);
  });

  describe('on GET', () => {
    test('should return individual financial details page', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividual)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('details of your finances');
        });
    });
    test('should return organisation financial details page', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('your company or organisation&#39;s most recent statement of accounts');
        });
    });
    test('should not match expected string, and log error, if draft store fails to return anything', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('your company or organisation&#39;s most recent statement of accounts');
          expect(mockLogger.error).toHaveBeenCalledWith('Redis DraftStore failure.');
        });
    });
  });


  describe('on POST', () => {
    test('should redirect for individual', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividual)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect for organisation', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should not redirect, and log error, if draft store fails to return anything', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => {
          throw new Error('Redis DraftStore failure.');
        }),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockLogger.error).toHaveBeenCalledWith('Redis DraftStore failure.');
        });
    });
    test('should be 404 for no caseId in path', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(constructResponseUrlWithIdParams('', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(404);
        });
    });
    test('should be error for no respondent type in JSON', async () => {
      mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividualNoType)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockLogger.error).toHaveBeenCalledWith('No counterpartyType found.');
        });
    });
  });
});
