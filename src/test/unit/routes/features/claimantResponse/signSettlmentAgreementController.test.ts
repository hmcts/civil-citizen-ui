import config from 'config';
import { t } from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  CLAIMANT_SIGN_SETTLEMENT_AGREEMENT,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'common/form/models/responseType';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));

describe('Sign Settlement Agreement', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return sign settlement agreement page', async () => {
      const civilClaimResponseMock = {
        'case_data': {
          'respondent1': {
            'responseType': ResponseType.PART_ADMISSION,
          },
          'partialAdmission': {
            'alreadyPaid': {
              'option': 'yes',
            },
            'howMuchDoYouOwe': {
              'amount': 200,
              'totalAmount': 1000,
            },
            'paymentIntention': {
              'repaymentPlan': {
                'paymentAmount': 50,
                'repaymentFrequency': TransactionSchedule.WEEK,
                'firstRepaymentDate': new Date(Date.now()),
              },
            },
          },
        },
      };
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
      };

      await request(app).get(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.CLAIMANT_ACCEPT_TERMS_OF_THE_AGREEMENT'));
      });
    });

    it('should redirect to the claimant response task-list if sign agreement checkbox is selected', async () => {
      await request(app).post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT).send({signed: true})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT)
        .send({signed: true})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

  });
});
