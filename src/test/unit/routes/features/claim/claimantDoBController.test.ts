import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  addDaysToDate,
  formatDateToFullDate,
  getDOBforAgeFromCurrentTime,
} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {JSDOM} from 'jsdom';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

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

describe('Claimant Date of Birth Controller', () => {
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
    it('should render date of birth page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
      expect(res.text).not.toContain('NaN');
    });

    it('should render date of birth page with values', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
      expect(res.text).not.toContain('NaN');
    });

    it('should render saved date of birth values', async () => {
      const mockClaim = new Claim();
      mockClaim.applicant1 = {
        dateOfBirth: {
          date: new Date('1980-03-02T00:00:00.000Z'),
        },
      } as Party;

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const res = await request(app).get(CLAIMANT_DOB_URL);
      const dom = new JSDOM(res.text);

      expect(res.status).toBe(200);
      expect(dom.window.document.getElementById('day')?.getAttribute('value')).toBe('2');
      expect(dom.window.document.getElementById('month')?.getAttribute('value')).toBe('3');
      expect(dom.window.document.getElementById('year')?.getAttribute('value')).toBe('1980');
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIMANT_DOB_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render date of birth page if there are form errors', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const res = await request(app).post(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should show validation error for claimant under 18', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      const today = new Date();
      const maxDate = formatDateToFullDate(addDaysToDate(getDOBforAgeFromCurrentTime(18), 1), 'en');

      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() - 16})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_A_DATE_BEFORE', {maxDate}));
        });
    });

    it('should redirect to the claimant phone number page', async () => {
      const mockClaim = new Claim();
      mockClaim.applicant1 = {} as Party;

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: 2, month: 3, year: 1980})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_PHONE_NUMBER_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: 4, month: 5, year: 1952})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
