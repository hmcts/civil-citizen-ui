import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_MONTHLY_EXPENSES_URL, DEBTS_URL} from '../../../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {
  buildDebtFormNo,
  buildDebtFormUndefined,
  buildDebtFormYes, buildDebtFormYesWithEmptyItems,
  buildDebtFormYesWithoutItems,
} from '../../../../../../utils/mockForm';
import {Claim} from '../../../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../../../main/common/models/statementOfMeans';
import {
  ENTER_AT_LEAST_ONE_DEBT,
  VALID_YES_NO_OPTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;


describe('Debts', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      const redisFailureError = 'Redis DraftStore failure.';
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(redisFailureError);
      });
      await request(app)
        .get(DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: redisFailureError});
        });
    });
  });

  test('should return http 500 when has error in the post method', async () => {
    const redisFailureError = 'Redis DraftStore failure.';
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(redisFailureError);
    });
    await request(app)
      .post(DEBTS_URL)
      .send(buildDebtFormYes())
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: redisFailureError});
      });
  });
  describe('on GET', () => {
    test('should open the debts page when in redis has no data ', async () => {
      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app)
        .get(DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have loans or credit card debts?');
        });
    });
    test('should open the debts page when in redis has data with option yes', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans = statementOfMeans;
        claim.statementOfMeans.debts = buildDebtFormYes();
        return claim;
      });
      await request(app)
        .get(DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have loans or credit card debts?');
        });
    });
    test('should open the debts page when in redis has data with option no', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans = statementOfMeans;
        claim.statementOfMeans.debts = buildDebtFormNo();
        return claim;
      });
      await request(app)
        .get(DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have loans or credit card debts?');
        });
    });
  });

  describe('on POST', () => {
    test('should validate when has no option selected', async () => {
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormUndefined())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(VALID_YES_NO_OPTION);
        });
    });
    test('should validate when has option is yes but there is no fields selected ', async () => {
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYesWithoutItems())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(ENTER_AT_LEAST_ONE_DEBT);
        });
    });

    test('should should redirect to when option is no when there is no data on redis', async () => {
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormNo())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    test('should should redirect to when option is yes when there is no data on redis', async () => {
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYes())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    test('should should redirect to when option is yes when has data on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans = statementOfMeans;
        claim.statementOfMeans.debts = buildDebtFormYes();
        return claim;
      });
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYes())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });
    test('should should redirect to when option is no when has data on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans = statementOfMeans;
        claim.statementOfMeans.debts = buildDebtFormNo();
        return claim;
      });
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormNo())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    test('should should redirect to when option is yes but has empty items', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans = statementOfMeans;
        claim.statementOfMeans.debts = buildDebtFormNo();
        return claim;
      });
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    test('should should redirect to when option is yes but there is no StatementOfMeans on claim', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = undefined;
        return claim;
      });
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });
    test('should should redirect to monthly expenses when option is yes but claim is undefined', async () => {
      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app)
        .post(DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });
  });
});
