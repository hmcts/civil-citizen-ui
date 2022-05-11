import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  EVIDENCE_URL,
  IMPACT_OF_DISPUTE_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockRedisFailure } from '../../../../../utils/mockDraftStore';
import { EvidenceType } from '../../../../../../main/common/models/evidence/evidenceType';
import { FREE_TEXT_MAX_LENGTH } from '../../../../../../main/common/form/validators/validationConstraints';
import {
  VALID_TEXT_LENGTH,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const civilClaimResponseMock = require('./evidenceListMock.json');
const civilClaimResponseMockWithOneEvidenceItem: string = JSON.stringify(civilClaimResponseMock);
const mockWithoutRespondentPhone = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithOneEvidenceItem)),
};

describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('on Get', () => {
  test('should return on your evidence list page successfully', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(EVIDENCE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('List your evidence');
      });
  });

  test('should return on your evidence list page successfully when less than 4 items saved', async () => {
    app.locals.draftStoreClient = mockWithoutRespondentPhone;
    await request(app)
      .get(EVIDENCE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('List your evidence');
      });
  });

  test('should return 500 status code when error occurs', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(EVIDENCE_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});

describe('on Post', () => {
  const COMMENT = 'Nam ac ante id turpis elementum laoreet. Nunc a erat nec eros iaculis lobortis ut in quam.';
  const tooLongEvidenceDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
  const EVIDENCE_ITEM = [
    { 'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': 'Test evidence details' },
    { 'type': null, 'description': ''},
    { 'type': null, 'description': ''},
    { 'type': null, 'description': ''},
  ];

  const EVIDENCE_ITEM_INVALID = [
    { 'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': tooLongEvidenceDetails },
    { 'type': null, 'description': ''},
    { 'type': null, 'description': ''},
    { 'type': null, 'description': ''},
  ];

  test('should return errors when comment max length is greater than 99000 characters', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(EVIDENCE_URL)
      .send({comment: tooLongEvidenceDetails, evidenceItem: EVIDENCE_ITEM})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_TEXT_LENGTH);
      });
  });

  test('should return errors when description max length is greater than 99000 characters', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(EVIDENCE_URL)
      .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM_INVALID})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_TEXT_LENGTH);
      });
  });

  test('should redirect with empties input', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(EVIDENCE_URL)
      .send({comment: '', evidenceItem: []})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(IMPACT_OF_DISPUTE_URL);
      });
  });

  test('should redirect with correct input', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(EVIDENCE_URL)
      .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(IMPACT_OF_DISPUTE_URL);
      });
  });

  test('should return status 500 when there is error', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .post(EVIDENCE_URL)
      .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM})
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});
