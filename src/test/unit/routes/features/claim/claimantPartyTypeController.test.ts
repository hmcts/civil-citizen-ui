import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {PartyType} from 'models/partyType';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Party} from 'models/party';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/features/claim/yourDetails/claimantDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetClaimantInformation = getClaimantInformation as jest.Mock;
const mockSaveClaimantProperty = saveClaimantProperty as jest.Mock;

describe('Claim Party Type Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClaimantInformation.mockResolvedValue(new Party());
    mockSaveClaimantProperty.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render claimant party type selection page successfully', async () => {
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
      expect(mockGetClaimantInformation).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetClaimantInformation.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on POST', () => {
    it('should render error message when claiming as is not selected', async () => {
      const res = await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain(TestMessages.CLAIMANT_PARTY_TYPE_REQUIRED);
      expect(mockSaveClaimantProperty).not.toHaveBeenCalled();
    });

    it('should render claimant individual details page when radio "An individual" is selected', async () => {
      const res = await request(app)
        .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
        .send({'option': PartyType.INDIVIDUAL});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_INDIVIDUAL_DETAILS_URL);
      expect(mockSaveClaimantProperty).toHaveBeenCalledWith(
        expect.any(Object),
        'type',
        PartyType.INDIVIDUAL,
      );
    });

    it('should render claimant sole trader details page when radio "A sole trader or self-employed person" is selected', async () => {
      const res = await request(app)
        .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
        .send({'option': PartyType.SOLE_TRADER});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_SOLE_TRADER_DETAILS_URL);
    });

    it('should render claimant company details page when radio "A limited company" is selected', async () => {
      const res = await request(app)
        .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
        .send({'option': PartyType.COMPANY});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_COMPANY_DETAILS_URL);
    });

    it('should render claimant organisation details page when radio "Another type of organisation" is selected', async () => {
      const res = await request(app)
        .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
        .send({'option': PartyType.ORGANISATION});
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_ORGANISATION_DETAILS_URL);
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveClaimantProperty.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      const res = await request(app)
        .post(CLAIMANT_PARTY_TYPE_SELECTION_URL)
        .send({'option': PartyType.ORGANISATION});
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
