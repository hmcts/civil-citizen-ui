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
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const civilClaimResponseMockWithNoEvidence =
{
  'case_data': {
    'claimDetails': {
      'evidence': {
        'comment': '',
        'evidenceItem': [{}],
      },
    },
  },
};

const civilClaimResponseMock =
{
  'case_data': {
    'claimDetails': {
      'reason': '',
      'evidence': {
        'comment': '',
        'evidenceItem': [
          { 'type': 'Expert witness', 'description': 'Nam ac ante id turpis elementum laoreet.' },
        ],
      },
    },
  },
};

const civilClaimResponseMockWithMultipleEvidences =
{
  'case_data': {
    'claimDetails': {
      'reason': '',
      'evidence': {
        'comment': '',
        'evidenceItem': [
          { 'type': 'Expert witness', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Contracts and agreements', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Letters, emails and other correspondence', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Photo evidence', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Receipts', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Statements of account', 'description': 'Nam ac ante id turpis elementum laoreet.' },
          { 'type': 'Expert witness', 'description': 'Nam ac ante id turpis elementum laoreet.' },
        ],
      },
    },
  },
};

describe('Claimant Evidence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return on your evidence list page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(CLAIM_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return on your evidence list page successfully when no items saved', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMockWithNoEvidence.case_data);
      });
      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return on your evidence list page successfully when less than 4 items saved', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return on your evidence list page successfully when more than 4 items saved', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMockWithMultipleEvidences.case_data);
      });
      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    const tooLongEvidenceDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
    const EVIDENCE_ITEM = [
      {'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': 'Test evidence details'},
      {'type': null, 'description': ''},
      {'type': null, 'description': ''},
      {'type': null, 'description': ''},
    ];

    const EVIDENCE_ITEM_INVALID = [
      {'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': tooLongEvidenceDetails},
      {'type': null, 'description': ''},
      {'type': null, 'description': ''},
      {'type': null, 'description': ''},
    ];

    it('should return errors when comment max length is greater than 99000 characters', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({evidenceItem: EVIDENCE_ITEM_INVALID})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
        });
    });

    it('should redirect with empties input and redirect to task list', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({evidenceItem: []})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_TASK_LIST_URL);
        });
    });

    it('should return status 500 when there is error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_EVIDENCE_URL)
        .send({evidenceItem: EVIDENCE_ITEM})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
