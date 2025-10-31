import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION,
} from 'routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {ResponseType} from 'common/form/models/responseType';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {PartialAdmission} from 'models/partialAdmission';
import {GenericYesNo} from 'form/models/genericYesNo';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {Party} from 'common/models/party';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {RepaymentPlan} from 'common/models/repaymentPlan';
import {YesNo} from 'form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CIVIL_SERVICE_SUBMIT_EVENT} from 'client/civilServiceUrls';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { RepaymentDecisionType } from 'common/models/claimantResponse/RepaymentDecisionType';
import {CivilServiceClient} from 'client/civilServiceClient';
import {PartyType} from 'models/partyType';
import {AppSession, UserDetails} from 'models/AppRequest';

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
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_SUBMIT_EVENT
        .replace(':submitterId','1234')
        .replace(':caseId',':id'))
      .reply(200, {});
  });

  function getMockClaim() {
    const date = new Date(Date.now());
    const mockClaim = new Claim();
    mockClaim.defendantSignedSettlementAgreement = YesNo.YES;
    mockClaim.respondent1 = new Party();
    mockClaim.respondent1.responseType = ResponseType.PART_ADMISSION;
    mockClaim.partialAdmission = new PartialAdmission();
    mockClaim.partialAdmission.alreadyPaid = new GenericYesNo('yes');
    mockClaim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
    mockClaim.partialAdmission.paymentIntention = new PaymentIntention();
    mockClaim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    mockClaim.partialAdmission.paymentIntention.repaymentPlan = {} as RepaymentPlan;
    mockClaim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount = 50;
    mockClaim.partialAdmission.paymentIntention.repaymentPlan.repaymentFrequency = TransactionSchedule.WEEK;
    mockClaim.partialAdmission.paymentIntention.repaymentPlan.firstRepaymentDate = date;
    return mockClaim;
  }

  describe('on GET', () => {
    const date = new Date(Date.now());
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });
    it('should return respond to settlement agreement page', async () => {
      const mockClaim = getMockClaim();
      const claim = Object.assign(new Claim(), mockClaim);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim)),
        );

      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN',
          {defendant: '', amount: '200', paymentAmount: '50', frequency: 'week', firstRepaymentDate: formatDateToFullDate(date)},
        ));
      });
    });

    it('should return respond to settlement agreement page for pay by set date', async () => {
      const mockClaim = getMockClaim();
      mockClaim.partialAdmission = new PartialAdmission();
      mockClaim.partialAdmission.paymentIntention = new PaymentIntention();
      mockClaim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
      mockClaim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      mockClaim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
      const claim = Object.assign(new Claim(), mockClaim);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim)),
        );

      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE',
          {defendant: '', amount: '200', paymentDate: formatDateToFullDate(date)},
        ));
      });
    });

    it('should return respond to settlement agreement page for pay by set date when claimant plan is accepted', async () => {
      const mockClaim = getMockClaim();
      mockClaim.claimantResponse = Object.assign({}, new ClaimantResponse());
      mockClaim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      mockClaim.claimantResponse.suggestedPaymentIntention = {
        'paymentOption': PaymentOptionType.BY_SET_DATE,
        'paymentDate': new Date(Date.now()),
      };
      mockClaim.defendantSignedSettlementAgreement = YesNo.YES;

      const claim = Object.assign(new Claim(), mockClaim);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim)),
        );

      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE',
          {defendant: '', amount: '200', paymentDate: formatDateToFullDate(date)},
        ));
      });
    });

    it('should return respond to settlement agreement page for pay by Instalments when claimant plan is accepted', async () => {
      const mockClaim = getMockClaim();
      mockClaim.claimantResponse = Object.assign({}, new ClaimantResponse());
      mockClaim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      mockClaim.claimantResponse.suggestedPaymentIntention = {
        'paymentOption': PaymentOptionType.INSTALMENTS,
        'paymentDate': new Date(Date.now()),
        'repaymentPlan': {
          'paymentAmount': 1000,
          'firstRepaymentDate': new Date('2024-11-01'),
          'repaymentFrequency': 'MONTH',
        },
      };
      mockClaim.defendantSignedSettlementAgreement = YesNo.YES;

      const claim = Object.assign(new Claim(), mockClaim);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim)),
        );

      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN',
          {defendant: '', amount: '200',paymentAmount: '1000',frequency: 'month' , firstRepaymentDate: formatDateToFullDate(new Date('2024-11-01'))},
        ));
      });
    });

    it('should return respond to settlement agreement page for pay by immediately when claimant plan is accepted', async () => {
      const mockClaim = getMockClaim();
      mockClaim.respondent1 = new Party();
      mockClaim.respondent1.partyDetails = { 'firstName': 'John', 'lastName': 'White' };
      mockClaim.respondent1.type = PartyType.INDIVIDUAL;
      mockClaim.applicant1 = new Party();
      mockClaim.applicant1.partyDetails = { 'firstName': 'James', 'lastName': 'White' };
      mockClaim.applicant1.type = PartyType.INDIVIDUAL;
      mockClaim.claimantResponse= new ClaimantResponse();
      mockClaim.claimantResponse.courtDecision =
          RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      mockClaim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      mockClaim.claimantResponse.suggestedPaymentIntention.paymentOption =
          PaymentOptionType.IMMEDIATELY;
      mockClaim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date();
      mockClaim.defendantSignedSettlementAgreement = YesNo.YES;

      const claim = Object.assign(new Claim(), mockClaim);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim)),
        );

      await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.TITLE'));
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_IMMEDIATELY_PLAN',
          {defendant: 'John White', amount: '200', claimant: 'James White', paymentDate: formatDateToFullDate(new Date())},
        ));
      });
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('Something went wrong');
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);

      await request(app)
        .get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      const mockClaim = new Claim();
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim as Claim);
      await request(app).post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION'));
      });
    });

    it('should redirect to the claimant response task-list if sign agreement checkbox is selected', async () => {
      const mockClaim = getMockClaim();
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim as Claim);
      app.request.session = <AppSession>{user: <UserDetails>{id: '1234'}};
      await request(app).post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
        });
    });

    it('should return status 500 when error thrown', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(null);
      await request(app)
        .post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });

  });
});
