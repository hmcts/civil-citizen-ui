import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from 'app';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getFinancialDetails} from 'services/features/claimantResponse/claimantResponseService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');
jest.mock('common/utils/urlFormatter');
jest.mock('common/utils/dateUtils');
jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

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
});
