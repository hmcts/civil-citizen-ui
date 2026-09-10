import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  FLIGHT_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import { AirlineList } from 'models/airlines/flights';

jest.mock('client/civilServiceClient');
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

describe('Flight details Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});

    jest.spyOn(CivilServiceClient.prototype, 'getAirlines').mockResolvedValue([
      {airline: 'airline 1', epimsID: '1'},
      {airline: 'airline 2', epimsID: '2'},
    ] as AirlineList[]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return flight details page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(`${FLIGHT_DETAILS_URL}?lang=en`)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.FLIGHT_DETAILS.FLIGHT_DETAILS'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(FLIGHT_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect when flight details are ok', async () => {
      const flightDetails = {
        airline: 'Ryanair',
        flightNumber: '121314',
        year: '2023',
        month: '9',
        day: '29',
      };
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .send(flightDetails)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        });
    });

    it('should return errors on empty inputs', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(`${FLIGHT_DETAILS_URL}?lang=en`)
        .send({})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.FLIGHT_DETAILS.FLIGHT_NUMBER_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      const flightDetails = {
        airline: 'Ryanair',
        flightNumber: '121314',
        year: '2023',
        month: '9',
        day: '29',
      };

      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(FLIGHT_DETAILS_URL)
        .send(flightDetails)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
