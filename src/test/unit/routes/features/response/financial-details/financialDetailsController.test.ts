import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  setFinancialDetailsControllerLogger,
} from 'routes/features/response/financialDetails/financialDetailsController';
import {LoggerInstance} from 'winston';
import {FINANCIAL_DETAILS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const claimIndividualMock = require('./claimIndividualMock.json');
const claimIndividualMockNoType = require('./claimIndividualMockNoType.json');
const claimOrganisationMock = require('./claimOrganisationMock.json');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

describe('Citizen financial details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    setFinancialDetailsControllerLogger(mockLogger);
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return individual financial details page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimIndividualMock.case_data);
      });
      await request(app)
        .get(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('details of your finances');
        });
    });
    it('should return organisation financial details page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimOrganisationMock.case_data);
      });
      await request(app)
        .get(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('your company or organisation&#39;s most recent statement of accounts');
        });
    });
    it('should not match expected string, and log error, if draft store fails to return anything', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).not.toContain('your company or organisation&#39;s most recent statement of accounts');
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect for individual', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimIndividualMock.case_data);
      });
      await request(app)
        .post(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect for organisation', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimOrganisationMock.case_data);
      });
      await request(app)
        .post(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should not redirect, and log error, if draft store fails to return anything', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(constructResponseUrlWithIdParams('1646768947464020', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should be 404 for no caseId in path', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimOrganisationMock.case_data);
      });
      await request(app)
        .post(constructResponseUrlWithIdParams('', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(404);
        });
    });
    it('should be error for no respondent type in JSON', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), claimIndividualMockNoType.case_data);
      });
      await request(app)
        .post(constructResponseUrlWithIdParams('1646818997929180', FINANCIAL_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockLogger.error).toHaveBeenCalledWith('No partyType found.');
        });
    });
  });
});
