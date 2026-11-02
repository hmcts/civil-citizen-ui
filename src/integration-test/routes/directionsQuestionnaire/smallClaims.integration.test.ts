import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  VULNERABILITY_URL,
  SUPPORT_REQUIRED_URL,
} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {YesNo} from '../../../main/common/form/models/yesNo';

const CLAIM_ID = '000MC123';
const FUTURE_RESPONSE_DEADLINE = new Date('2050-05-15T00:00:00.000Z');
const SUBMITTED_DATE = '2026-01-02T09:00:00.000Z';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const createDraftStoreClient = (claim: Claim) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    id: claim.id,
    case_data: claim,
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve(-1)),
  expireat: jest.fn(() => Promise.resolve({})),
});

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = createDraftStoreClient(claim);
};

const buildSmallClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = new Date(SUBMITTED_DATE);
  claim.respondent1ResponseDeadline = FUTURE_RESPONSE_DEADLINE;
  claim.totalClaimAmount = 1000;
  claim.draftClaimCreatedAt = new Date(SUBMITTED_DATE);
  claim.respondent1 = Object.assign(new Party(), {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      title: 'Mr',
      firstName: 'Joe',
      lastName: 'Defendant',
    },
  });
  return claim;
};

describe('Integration: small-claims directions questionnaire', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  it('shows a validation error when determination without a hearing is not answered', async () => {
    setDraftClaim(buildSmallClaim());

    await request(app)
      .post(route(DETERMINATION_WITHOUT_HEARING_URL))
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Determination without Hearing Questions');
        expect(res.text).toContain('govuk-error-message');
        expect(res.text).toContain('Select if you consider this hearing is suitable for determination without a hearing or not');
      });
  });

  it('walks the small-claims path from determination without a hearing to support required', async () => {
    setDraftClaim(buildSmallClaim());

    await request(app)
      .get(route(DETERMINATION_WITHOUT_HEARING_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Determination without Hearing Questions');
      });

    await request(app)
      .post(route(DETERMINATION_WITHOUT_HEARING_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect('Location', route(DQ_EXPERT_SMALL_CLAIMS_URL));

    await request(app)
      .get(route(DQ_EXPERT_SMALL_CLAIMS_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Using an expert');
      });

    await request(app)
      .post(route(DQ_EXPERT_SMALL_CLAIMS_URL))
      .send({})
      .expect(302)
      .expect('Location', route(DQ_GIVE_EVIDENCE_YOURSELF_URL));

    await request(app)
      .get(route(DQ_GIVE_EVIDENCE_YOURSELF_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to give evidence yourself?');
      });

    await request(app)
      .post(route(DQ_GIVE_EVIDENCE_YOURSELF_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect('Location', route(DQ_DEFENDANT_WITNESSES_URL));

    await request(app)
      .get(route(DQ_DEFENDANT_WITNESSES_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have other witnesses?');
      });

    await request(app)
      .post(route(DQ_DEFENDANT_WITNESSES_URL))
      .send({option: YesNo.NO, witnessItems: []})
      .expect(302)
      .expect('Location', route(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL));

    await request(app)
      .post(route(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect('Location', route(DQ_PHONE_OR_VIDEO_HEARING_URL));

    await request(app)
      .get(route(DQ_PHONE_OR_VIDEO_HEARING_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to ask for a telephone or video hearing?');
      });

    await request(app)
      .post(route(DQ_PHONE_OR_VIDEO_HEARING_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect('Location', route(VULNERABILITY_URL));

    await request(app)
      .get(route(VULNERABILITY_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you, your experts or witnesses vulnerable in a way that the court needs to consider?');
      });

    await request(app)
      .post(route(VULNERABILITY_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect('Location', route(SUPPORT_REQUIRED_URL));
  });
});
