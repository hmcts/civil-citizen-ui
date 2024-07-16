import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_PRIORITY_DEBTS_URL, CITIZEN_DEBTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';

const {app} = require('../../../../../../main/app');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Priority Debts Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .get(CITIZEN_PRIORITY_DEBTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Debts you&#39;re behind on');
        });
    });
    it('should return 500 status code when there is an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_PRIORITY_DEBTS_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {

    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
    });

    it('should show errors when gas is selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'gas',
              transactionSource: {
                name: 'Gas',
                amount: '',
              },
            },
            electricity: {
              declared: 'electricity',
              transactionSource: {
                name: 'Electricity',
                amount: '55',
              },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.GAS_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.GAS_SCHEDULE_ERROR);
          expect(res.text).toContain(TestMessages.ELECTRICITY_DEBT_SCHEDULE_ERROR);
        });
    });
    it('should show errors when gas and water are selected but no amount or schedule selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'gas',
              transactionSource: {
                name: 'Gas',
                amount: '',
              },
            },
            water: {
              declared: 'water',
              transactionSource: {
                name: 'Water',
                amount: '',
              },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.GAS_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.GAS_SCHEDULE_ERROR);
          expect(res.text).toContain(TestMessages.WATER_AMOUNT_ERROR);
          expect(res.text).toContain(TestMessages.WATER_AMOUNT_ERROR);
        });
    });
    it('should show errors when mortgage is selected but no schedule selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'mortgage',
              transactionSource: {
                name: 'Mortgage',
                amount: '5129',
              },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MORTGAGE_DEBT_SCHEDULE_ERROR);
        });
    });
    it('should show errors when rent is selected and amount is negative', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'rent',
              transactionSource: {
                name: 'Rent',
                amount: '-5129',
              },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.RENT_DEBT_CORRECT_AMOUNT_ERROR);
        });
    });
    it('should show errors when couincil tax is selected and amount has three decimal places', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'councilTax',
              transactionSource: {
                name: 'Council Tax or Community Charge',
                amount: '2000.859',
              },
            },
          },
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.COUINCIL_TAX_CORRECT_AMOUNT_ERROR);
        });
    });
    it('should redirect when no data is selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {},
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEBTS_URL);
        });
    });
    it('should redirect when correct data is selected', async () => {
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'gas',
              transactionSource: {
                name: 'Gas',
                amount: '85.92',
                schedule: 'MONTH',
              },
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEBTS_URL);
        });
    });

    it('should return status 500 when error occurs', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_PRIORITY_DEBTS_URL)
        .send({
          model: {
            gas: {
              declared: 'gas',
              transactionSource: {
                name: 'Gas',
                amount: '85.92',
                schedule: 'MONTH',
              },
            },
          },
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
