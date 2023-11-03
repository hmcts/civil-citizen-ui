import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getFinancialDetails} from 'services/features/claimantResponse/claimantResponseService';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'form/models/responseType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import * as utilService from 'modules/utilityService';
import { CaseState } from 'common/form/models/claimDetails';
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/common/utils/urlFormatter');
jest.mock('../../../../../main/common/utils/dateUtils');
jest.mock('../../../../../main/services/features/claimantResponse/claimantResponseService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Review Defendant\'s Response Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockConstructURL = constructResponseUrlWithIdParams as jest.Mock;
  const mockDateFormat = formatDateToFullDate as jest.Mock;
  const mockFinancialDetails = getFinancialDetails as jest.Mock;
  const claim = new Claim();
  claim.statementOfMeans = new StatementOfMeans();

  mockConstructURL.mockImplementation(() => 'VALID_URL');
  mockDateFormat.mockImplementation(() => 'validDate');
  mockFinancialDetails.mockImplementation(() => [[], [], [], [], [], [], [], [], []]);

  beforeEach(() => {
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
  });

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  it('should return defendant\'s response', async () => {
    await request(app).get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('The defendant’s response');
      expect(res.text).toContain('Full response');
      expect(res.text).toContain('Download their full response (PDF)');
    });
  });

  it('should return error page on redis failure', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    jest.spyOn(utilService, 'getClaimById').mockRejectedValue(TestMessages.REDIS_FAILURE);
    await request(app).get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL).expect((res) => {
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  it('should display *How they want to pay* section when claimant response status is set to partial admit paid by set date', async () => {
    claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
    claim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
    claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree('Reasons here...');
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    mockGetCaseData.mockImplementation(() => claim);
    await request(app)
      .get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How they want to pay');
        expect(res.text).toContain('Why they can’t pay the full amount now');
        expect(res.text).toContain('See their financial details');
      });
  });

  it('should display *How they want to pay* section when claimant response status is set to partial admit paid by instalments', async () => {
    claim.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS;
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
    claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree('Reasons here...');
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    const firstRepaymentDate = new Date(Date.now());
    firstRepaymentDate.setDate(firstRepaymentDate.getDate() + 1);
    claim.partialAdmission.paymentIntention.repaymentPlan = {
      paymentAmount: 10,
      repaymentFrequency: TransactionSchedule.WEEK,
      firstRepaymentDate: firstRepaymentDate,
    };
    mockGetCaseData.mockImplementation(() => claim);
    await request(app)
      .get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How they want to pay');
        expect(res.text).toContain('The defendant suggested this repayment plan:');
      });
  });

  it('should redirect How they want to pay page', async () => {
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.partialAdmission.paymentIntention.paymentDate = new Date();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(700,1200);
    const reason = "Not able to pay the amount now";
    claim.statementOfMeans.explanation = {text: reason};
    mockGetCaseData.mockImplementation(() => claim);
    await request(app)
      .post(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How they want to pay');
      });
  });

  it('should redirect to claimant response task list.', async () => {
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    mockGetCaseData.mockImplementation(() => claim);
    await request(app)
      .post(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL)
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual('VALID_URL');
      });
  });
});
