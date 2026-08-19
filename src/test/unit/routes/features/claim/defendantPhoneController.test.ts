import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIM_DEFENDANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {Claim} from 'models/claim';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/claim/yourDetails/phoneService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockGetTelephone = getTelephone as jest.Mock;
const mockSaveTelephone = saveTelephone as jest.Mock;

const PHONE_NUMBER = '07000000000';

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Defendant Phone Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return on your defendant phone number page successfully', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber());

      await request(app)
        .get(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DEFENDANT_PHONE_NUMBER.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error('Draft store failure'));
      mockGetTelephone.mockRejectedValue(new Error('Draft store failure'));

      await request(app)
        .get(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to task list when optional phone number provided', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockSaveTelephone.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should redirect to task list when optional phone number is not provided', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockSaveTelephone.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: ''})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should accept input with trailing whitespaces', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockSaveTelephone.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: `${PHONE_NUMBER}   `})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return error on incorrect input', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: 'abc'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should return error on input with interior spaces', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: '123 456'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });

    it('should return status 500 when there is error', async () => {
      mockSaveTelephone.mockRejectedValue(new Error('Save error'));

      await request(app)
        .post(CLAIM_DEFENDANT_PHONE_NUMBER_URL)
        .send({telephoneNumber: PHONE_NUMBER})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
