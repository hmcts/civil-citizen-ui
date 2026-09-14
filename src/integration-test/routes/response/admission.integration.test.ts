import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_PARTNER_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../main/routes/urls';
import {
  createClaimWithBasicApplicantDetails,
  createClaimWithBasicRespondentDetails,
} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {
  isCarmEnabledForCase,
  isMintiEnabledForCase,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from '../../../main/common/models/claim';
import {ResponseType} from '../../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {ResidenceType} from '../../../main/common/form/models/statementOfMeans/residence/residenceType';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {PartialAdmission} from '../../../main/common/models/partialAdmission';
import {Party} from '../../../main/common/models/party';

const CLAIM_ID = '000MC456';
const FUTURE_RESPONSE_DEADLINE = new Date('2050-05-15T00:00:00.000Z');
const SUBMITTED_DATE = '2026-01-02T09:00:00.000Z';

const route = (url: string, claimId = CLAIM_ID): string => url.replace(':id', claimId);

const createDraftStoreClient = (claim: Claim) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    id: claim.id,
    case_data: claim,
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
});

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = createDraftStoreClient(claim);
};

const withCommonClaimMetadata = (claim: Claim): Claim => {
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = new Date(SUBMITTED_DATE);
  claim.respondent1ResponseDeadline = FUTURE_RESPONSE_DEADLINE;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = createClaimWithBasicApplicantDetails().applicant1;
  return claim;
};

const buildFullAdmitClaim = (paymentOption: PaymentOptionType): Claim => {
  const claim = withCommonClaimMetadata(createClaimWithBasicRespondentDetails());
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  return claim;
};

const buildPartAdmitClaim = (): Claim => {
  const claim = withCommonClaimMetadata(new Claim());
  claim.respondent1 = Object.assign(new Party(), createClaimWithBasicRespondentDetails().respondent1);
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  return claim;
};

describe('Integration: full/part admission and statement of means', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  it('renders how you respond and rejects an empty response type', async () => {
    setDraftClaim(buildFullAdmitClaim(PaymentOptionType.IMMEDIATELY));

    const getResponse = await request(app).get(route(CITIZEN_RESPONSE_TYPE_URL));
    expect(getResponse.status).toBe(200);
    expect(getResponse.text).toContain('How do you respond to the claim?');
    expect(getResponse.text).toContain('Admit all of the claim');
    expect(getResponse.text).toContain('Admit part of the claim');

    const validation = await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({});
    expect(validation.status).toBe(200);
    expect(validation.text).toContain('There was a problem');
    expect(validation.text).toContain('Select how you respond to the claim');
  });

  it('admits the claim in full, chooses to pay immediately, and returns to the task list', async () => {
    setDraftClaim(buildFullAdmitClaim(PaymentOptionType.IMMEDIATELY));

    const admit = await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({responseType: ResponseType.FULL_ADMISSION});
    expect(admit.status).toBe(302);
    expect(admit.header.location).toBe(route(RESPONSE_TASK_LIST_URL));

    const paymentGet = await request(app).get(route(CITIZEN_PAYMENT_OPTION_URL));
    expect(paymentGet.status).toBe(200);
    expect(paymentGet.text).toContain('When do you want to pay');

    const paymentPost = await request(app)
      .post(route(CITIZEN_PAYMENT_OPTION_URL))
      .send({paymentType: PaymentOptionType.IMMEDIATELY});
    expect(paymentPost.status).toBe(302);
    expect(paymentPost.header.location).toBe(route(RESPONSE_TASK_LIST_URL));
  });

  it('walks statement of means residence when the defendant cannot pay immediately', async () => {
    setDraftClaim(buildFullAdmitClaim(PaymentOptionType.BY_SET_DATE));

    const residenceGet = await request(app).get(route(CITIZEN_RESIDENCE_URL));
    expect(residenceGet.status).toBe(200);
    expect(residenceGet.text).toContain('Where do you live?');

    const invalid = await request(app)
      .post(route(CITIZEN_RESIDENCE_URL))
      .send({type: ''});
    expect(invalid.status).toBe(200);
    expect(invalid.text).toContain('There was a problem');

    const valid = await request(app)
      .post(route(CITIZEN_RESIDENCE_URL))
      .send({type: ResidenceType.OWN_HOME});
    expect(valid.status).toBe(302);
    expect(valid.header.location).toBe(route(CITIZEN_PARTNER_URL));
  });

  it('admits part of the claim and records whether the admitted amount is already paid', async () => {
    setDraftClaim(buildPartAdmitClaim());

    const admit = await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({responseType: ResponseType.PART_ADMISSION});
    expect(admit.status).toBe(302);
    expect(admit.header.location).toBe(route(CITIZEN_ALREADY_PAID_URL));

    const alreadyPaidGet = await request(app).get(route(CITIZEN_ALREADY_PAID_URL));
    expect(alreadyPaidGet.status).toBe(200);
    expect(alreadyPaidGet.text).toContain('Have you paid the claimant the amount you admit you owe?');

    const alreadyPaidPost = await request(app)
      .post(route(CITIZEN_ALREADY_PAID_URL))
      .send({option: YesNo.YES});
    expect(alreadyPaidPost.status).toBe(302);
    expect(alreadyPaidPost.header.location).toBe(route(RESPONSE_TASK_LIST_URL));
  });
});
