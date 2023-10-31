import config from 'config';
import { t } from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
} from '../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'common/form/models/responseType';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getClaimById} from "modules/utilityService";
import {Claim} from "models/claim";
import {PartialAdmission} from "models/partialAdmission";
import {GenericYesNo} from "form/models/genericYesNo";
import {HowMuchDoYouOwe} from "form/models/admission/partialAdmission/howMuchDoYouOwe";
import {Party} from 'common/models/party';
import {PaymentIntention } from 'common/form/models/admission/paymentIntention';
import {RepaymentPlan} from 'common/models/repaymentPlan';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Respond To Settlement Agreement', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    const date = new Date(Date.now());
    it('should return respond to settlement agreement page', async () => {
      const mockClaim = new Claim();
      mockClaim.respondent1 = new Party();
      mockClaim.respondent1.responseType = ResponseType.PART_ADMISSION;
      mockClaim.partialAdmission = new PartialAdmission();
      mockClaim.partialAdmission.alreadyPaid = new GenericYesNo('yes');
      mockClaim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      mockClaim.partialAdmission.paymentIntention = new PaymentIntention();
      mockClaim.partialAdmission.paymentIntention.repaymentPlan = {} as RepaymentPlan;
      mockClaim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount = 50;
      mockClaim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
      mockClaim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate = date;
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim);

      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN',
          {defendant: '', amount: '200', paymentAmount: '50', theAgreementRepaymentFrequency: 'week', firstRepaymentDate: formatDateToFullDate(date)},
        ));
      });
    });

    it('should return status 500 when error thrown', async () => {
      await request(app)
        .get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
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
      const mockClaim = new Claim();
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim as any);
      await request(app).post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION'));
      });
    });

    it('should redirect to the claimant response task-list if sign agreement checkbox is selected', async () => {
      await request(app).post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).send({option: 'yes'})
        .expect((res) => {
          // TODO: Change to 302 once redirect is implemented
          expect(res.status).toBe(302);
        });
    });

    it('should return status 500 when error thrown', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(null);
      await request(app)
        .post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

  });
});
