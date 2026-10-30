import {Response} from 'express';
import {t} from 'i18next';
import repaymentPlanSummaryClaimantController from 'routes/features/claimantResponse/ccj/repaymentPlanSummaryClaimantController';
import {CCJ_REPAYMENT_PLAN_CLAIMANT_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const viewPath = 'features/claimantResponse/ccj/repayment-plan-summary-claimant';
const claimId = '12345';

const repaymentClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
  claim.partialAdmission.paymentIntention.paymentDate = new Date('2026-12-01');
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 50,
    repaymentFrequency: TransactionSchedule.MONTH,
    firstRepaymentDate: new Date('2026-12-01'),
  };
  return claim;
};

describe('CCJ - claimant repayment plan', () => {
  it('should return repayment plan page', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(repaymentClaim());
    const res = createMockResponse();

    await getRouteHandler(repaymentPlanSummaryClaimantController, 'get', CCJ_REPAYMENT_PLAN_CLAIMANT_URL)(
      {
        params: {id: claimId},
        query: {lang: 'en'},
        cookies: {},
        session: createMockSession(),
      } as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      paymentOption: PaymentOptionType.INSTALMENTS,
      amount: 200,
      pageTitle: t('PAGES.REPAYMENT_PLAN_SUMMARY.REPAYMENT_PLAN', {lng: 'en'}),
    }));
  });
});
