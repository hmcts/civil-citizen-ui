import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CLAIM_EVIDENCE_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {EvidenceType} from 'models/evidence/evidenceType';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'models/evidence/evidenceItem';
import * as claimDetailsService from 'services/features/claim/details/claimDetailsService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/details/claimDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetClaimDetails = claimDetailsService.getClaimDetails as jest.Mock;
const mockSaveClaimDetails = claimDetailsService.saveClaimDetails as jest.Mock;

const createClaimDetails = (evidenceItems: unknown[] = []): ClaimDetails => {
  const claimDetails = new ClaimDetails();
  claimDetails.evidence = new Evidence('', evidenceItems as unknown as EvidenceItem[]);
  return claimDetails;
};

describe('Claimant Evidence Controller', () => {
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
    it('should return on evidence page successfully with empty evidence', async () => {
      const mockClaimDetails = createClaimDetails([]);
      mockGetClaimDetails.mockResolvedValue(mockClaimDetails);

      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return on evidence page with pre-populated evidence items', async () => {
      const mockClaimDetails = createClaimDetails([
        { type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Signed Contract' },
      ]);
      mockGetClaimDetails.mockResolvedValue(mockClaimDetails);

      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
          expect(res.text).toContain('Signed Contract');
        });
    });

    it('should return http 500 when getClaimDetails fails', async () => {
      mockGetClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    const tooLongDetails = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');

    it('should redirect to task list when form submission is valid', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({
          evidenceItem: [
            { type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details' },
          ],
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
          expect(mockSaveClaimDetails).toHaveBeenCalled();
        });
    });

    it('should redirect to task list when submitted with empty evidence items', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({
          evidenceItem: [],
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
          expect(mockSaveClaimDetails).toHaveBeenCalled();
        });
    });

    it('should render page with error when validation fails', async () => {
      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({
          evidenceItem: [
            { type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: tooLongDetails },
          ],
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
          expect(mockSaveClaimDetails).not.toHaveBeenCalled();
        });
    });

    it('should return http 500 when saveClaimDetails throws error', async () => {
      mockSaveClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({
          evidenceItem: [
            { type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details' },
          ],
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
