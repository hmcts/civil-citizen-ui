import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  DELAYED_FLIGHT_URL,
  FLIGHT_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {YesNo} from 'common/form/models/yesNo';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Delayed flight Controller', () => {
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
  });

  describe('on GET', () => {
    it('should return delayed flight page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(DELAYED_FLIGHT_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DELAYED_FLIGHT.CLAIMING_FOR_DELAYED'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(DELAYED_FLIGHT_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect when Yes', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: YesNo.YES})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(FLIGHT_DETAILS_URL);
        });
    });

    it('should redirect when No', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: YesNo.NO})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        });
    });

    it('should return errors on no input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: null})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: YesNo.NO})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
