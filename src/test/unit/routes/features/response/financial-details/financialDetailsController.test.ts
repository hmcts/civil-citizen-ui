import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  getFinancialDetailsUrlWithIdParam,
} from '../../../../../../main/common/utils/urlFormatter';
import {setLogger} from '../../../../../../main/routes/features/response/financialDetails/financialDetailsController';
import {LoggerInstance} from 'winston';

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

describe('Citizen financial details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    setLogger(mockLogger);
  });

  describe('on GET', () => {
    test('should return individual financial details page', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividual)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      console.log(claimIndividual);
      await request(app)
        .get( getFinancialDetailsUrlWithIdParam('1646818997929180') )
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
        .get(getFinancialDetailsUrlWithIdParam('1646768947464020') )
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
        .post(getFinancialDetailsUrlWithIdParam('1646818997929180') )
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect for organisation',  async() => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(getFinancialDetailsUrlWithIdParam('1646768947464020') )
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should be 404 for no caseId in path', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimOrganisation)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(getFinancialDetailsUrlWithIdParam(''))
        .expect((res) => {
          expect(res.status).toBe(404);
        });
    });
    test('should be error for no respondent type in JSON',  async() => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
        get: jest.fn(() => Promise.resolve(claimIndividualNoType)),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(getFinancialDetailsUrlWithIdParam('1646818997929180'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockLogger.error).toHaveBeenCalledWith('No counterpartyType found.');
        });
    });
  });
});
