import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_DEBTS_URL, CITIZEN_MONTHLY_EXPENSES_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  buildDebtFormNo,
  buildDebtFormUndefined,
  buildDebtFormYes,
  buildDebtFormYesWithDebtEmpty,
  buildDebtFormYesWithEmptyItems,
  buildDebtFormYesWithoutItems,
  buildDebtFormYesWithTotalOwnedEmpty,
  buildDebtFormYesWithTotalOwnedInvalid,
  buildDebtFormYesWithTotalOwnedZero,
} from '../../../../../../utils/mockForm';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Debts', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return http 500 when has error in the post method', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .post(CITIZEN_DEBTS_URL)
      .send(buildDebtFormYes())
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
  describe('on GET', () => {
    it('should redirect to response task-list page when in redis has no data ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      await request(app)
        .get(CITIZEN_DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should open the debts page when in redis has data with option yes', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.debts = buildDebtFormYes();
        return Object.assign(claim, fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .get(CITIZEN_DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have loans or credit card debts?');
        });
    });
    it('should open the debts page when in redis has data with option no', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.debts = buildDebtFormNo();
        return Object.assign(claim, fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .get(CITIZEN_DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have loans or credit card debts?');
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    it('should validate when has no option selected', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormUndefined())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.VALID_YES_NO_OPTION'));
        });
    });
    it('should validate when has option is yes but there is no fields selected ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithoutItems())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.ENTER_AT_LEAST_ONE_DEBT'));
        });
    });
    it('should validate when has option is yes but debt is empty ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithDebtEmpty())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.ENTER_A_DEBT'));
        });
    });
    it('should validate when has option is yes but Total owned is invalid ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithTotalOwnedInvalid())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
        });
    });

    it('should validate when has option is yes but Total owned is zero ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithTotalOwnedZero())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER'));
        });
    });
    it('should validate when has option is yes but Total owned is empty ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithTotalOwnedEmpty())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(t('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER'));
        });
    });

    it('should should redirect to when option is no when there is no data on redis', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormNo())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    it('should should redirect to when option is yes when there is no data on redis', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYes())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    it('should should redirect to when option is yes when has data on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.debts = buildDebtFormYes();
        return Object.assign(claim, fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYes())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    it('should should redirect to when option is no when has data on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.debts = buildDebtFormNo();
        return Object.assign(claim, fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormNo())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    it('should should redirect to when option is yes but has empty items', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        claim.statementOfMeans.debts = buildDebtFormNo();
        return Object.assign(claim, fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_MONTHLY_EXPENSES_URL);
        });
    });

    it('should should redirect to task-lits page when option is yes but there is no StatementOfMeans on claim', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = undefined;
        return claim;
      });
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should should redirect to response task-list page when option is yes but claim is undefined', async () => {
      mockGetCaseData.mockImplementation(async () => new Claim());
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithEmptyItems())
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
  });
});
