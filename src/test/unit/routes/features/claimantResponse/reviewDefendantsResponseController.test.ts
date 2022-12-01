import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {Claim} from '../../../../../main/common/models/claim';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';
import {formatDateToFullDate} from '../../../../../main/common/utils/dateUtils';
import {getFinancialDetails} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'form/models/responseType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/partialAdmission/paymentIntention';

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

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should return defendant\'s response', async () => {
    mockGetCaseData.mockImplementation(() => claim);
    await request(app).get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('The defendant’s response');
    });
  });

  it('should return error page on redis failure', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app).get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL).expect((res) => {
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  it('should redirect *How they want to pay* page', async () => {
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
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
