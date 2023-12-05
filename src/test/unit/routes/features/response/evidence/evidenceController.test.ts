import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_EVIDENCE_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {EvidenceType} from 'models/evidence/evidenceType';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');

const civilClaimResponseMock = require('./evidenceListMock.json');
const civilClaimResponseMockWithOneEvidenceItem: string = JSON.stringify(civilClaimResponseMock);
const mockWithLessThaFourEvidence = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithOneEvidenceItem)),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const civilClaimResponseTwoMock = require('./evidenceListTwoMock.json');
const civilClaimResponseMockWithFullAdmission: string = JSON.stringify(civilClaimResponseTwoMock);
const eMockWithFullAdmission = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithFullAdmission)),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on your evidence list page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
          expect(res.text).toContain('evidenceItem[0]');
          expect(res.text).toContain('evidenceItem[1]');
          expect(res.text).toContain('evidenceItem[2]');
          expect(res.text).toContain('evidenceItem[3]');
        });
    });

    it('should return on your evidence list page successfully when less than 4 items saved', async () => {
      app.locals.draftStoreClient = mockWithLessThaFourEvidence;
      await request(app)
        .get(CITIZEN_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('List your evidence');
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_EVIDENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    const COMMENT = 'Nam ac ante id turpis elementum laoreet. Nunc a erat nec eros iaculis lobortis ut in quam.';
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
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: tooLongEvidenceDetails, evidenceItem: EVIDENCE_ITEM})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
        });
    });

    it('should return errors when description max length is greater than 99000 characters', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM_INVALID})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
        });
    });

    it('should redirect with empties input and redirect to task list', async () => {
      app.locals.draftStoreClient = mockWithLessThaFourEvidence;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: '', evidenceItem: []})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with correct input and redirect to task list', async () => {
      app.locals.draftStoreClient = mockWithLessThaFourEvidence;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with empties input and redirect to impact of dispute', async () => {
      app.locals.draftStoreClient = eMockWithFullAdmission;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: '', evidenceItem: []})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect with correct input and redirect to impact of dispute', async () => {
      app.locals.draftStoreClient = eMockWithFullAdmission;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({comment: COMMENT, evidenceItem: EVIDENCE_ITEM})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
