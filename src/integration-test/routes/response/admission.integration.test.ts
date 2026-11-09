import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('services/features/common/responseDeadlineAgreedService', () => ({
  setResponseDeadline: jest.fn().mockResolvedValue(undefined),
}));

import {app} from '../../../main/app';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_DISABILITY_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  CITIZEN_PARTNER_URL,
  CITIZEN_PAYMENT_DATE_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
  FINANCIAL_DETAILS_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {Party} from '../../../main/common/models/party';
import {PartyType} from '../../../main/common/models/partyType';
import {ResponseType} from '../../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {FullAdmission} from '../../../main/common/models/fullAdmission';
import {PartialAdmission} from '../../../main/common/models/partialAdmission';
import {PaymentIntention} from '../../../main/common/form/models/admission/paymentIntention';
import {GenericYesNo} from '../../../main/common/form/models/genericYesNo';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {HowMuchDoYouOwe} from '../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {ResidenceType} from '../../../main/common/form/models/statementOfMeans/residence/residenceType';

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

const buildDefendant = (responseType?: ResponseType): Party => Object.assign(new Party(), {
  type: PartyType.INDIVIDUAL,
  responseType,
  partyDetails: {
    title: 'Mr',
    firstName: 'Joe',
    lastName: 'Defendant',
  },
});

const buildBaseClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = new Date(SUBMITTED_DATE);
  claim.respondent1ResponseDeadline = FUTURE_RESPONSE_DEADLINE;
  claim.totalClaimAmount = 1000;
  claim.draftClaimCreatedAt = new Date(SUBMITTED_DATE);
  claim.respondent1 = buildDefendant();
  claim.fullAdmission = undefined;
  return claim;
};

const buildFullAdmissionClaim = (paymentOption?: PaymentOptionType): Claim => {
  const claim = buildBaseClaim();
  claim.respondent1 = buildDefendant(ResponseType.FULL_ADMISSION);
  if (paymentOption) {
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = paymentOption;
  }
  return claim;
};

const buildPartAdmissionClaim = (alreadyPaid?: YesNo, admittedAmount?: number): Claim => {
  const claim = buildBaseClaim();
  claim.respondent1 = buildDefendant(ResponseType.PART_ADMISSION);
  claim.partialAdmission = new PartialAdmission();
  if (alreadyPaid) {
    claim.partialAdmission.alreadyPaid = new GenericYesNo(alreadyPaid);
  }
  if (admittedAmount !== undefined) {
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(admittedAmount, claim.totalClaimAmount);
  }
  return claim;
};

describe('Integration: defendant admission and statement of means', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  it('shows a validation error when no response to the claim is selected', async () => {
    setDraftClaim(buildBaseClaim());

    await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How do you respond to the claim?');
        expect(res.text).toContain('govuk-error-message');
        expect(res.text).toContain('Select how you respond to the claim');
      });
  });

  it('walks full admission immediate payment back to the task list', async () => {
    setDraftClaim(buildBaseClaim());
    await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({responseType: ResponseType.FULL_ADMISSION})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));

    setDraftClaim(buildFullAdmissionClaim());
    await request(app)
      .get(route(RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Decide how you');
        expect(res.text).not.toContain('Share your financial details');
      });

    await request(app)
      .get(route(CITIZEN_PAYMENT_OPTION_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('When do you want to pay the £');
      });

    await request(app)
      .post(route(CITIZEN_PAYMENT_OPTION_URL))
      .send({paymentType: PaymentOptionType.IMMEDIATELY})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));
  });

  it('walks full admission pay-by-date into statement of means', async () => {
    setDraftClaim(buildFullAdmissionClaim());
    await request(app)
      .post(route(CITIZEN_PAYMENT_OPTION_URL))
      .send({paymentType: PaymentOptionType.BY_SET_DATE})
      .expect(302)
      .expect('Location', route(CITIZEN_PAYMENT_DATE_URL));

    await request(app)
      .get(route(CITIZEN_PAYMENT_DATE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What date will you pay on?');
      });

    await request(app)
      .post(route(CITIZEN_PAYMENT_DATE_URL))
      .send({year: '9999', month: '1', day: '1'})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));

    setDraftClaim(buildFullAdmissionClaim(PaymentOptionType.BY_SET_DATE));
    await request(app)
      .get(route(RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Share your financial details');
      });

    await request(app)
      .get(route(FINANCIAL_DETAILS_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('your financial details');
      });

    await request(app)
      .post(route(FINANCIAL_DETAILS_URL))
      .expect(302)
      .expect('Location', route(CITIZEN_BANK_ACCOUNT_URL));

    await request(app)
      .get(route(CITIZEN_DISABILITY_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are you disabled?');
      });

    await request(app)
      .post(route(CITIZEN_DISABILITY_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect('Location', route(CITIZEN_SEVERELY_DISABLED_URL));

    await request(app)
      .post(route(CITIZEN_SEVERELY_DISABLED_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect('Location', route(CITIZEN_RESIDENCE_URL));

    await request(app)
      .get(route(CITIZEN_RESIDENCE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Where do you live?');
      });

    await request(app)
      .post(route(CITIZEN_RESIDENCE_URL))
      .send({type: ResidenceType.OWN_HOME})
      .expect(302)
      .expect('Location', route(CITIZEN_PARTNER_URL));
  });

  it('walks part admission from already-paid through the admitted amount', async () => {
    setDraftClaim(buildBaseClaim());
    await request(app)
      .post(route(CITIZEN_RESPONSE_TYPE_URL))
      .send({responseType: ResponseType.PART_ADMISSION})
      .expect(302)
      .expect('Location', route(CITIZEN_ALREADY_PAID_URL));

    setDraftClaim(buildBaseClaim());
    await request(app)
      .get(route(CITIZEN_OWED_AMOUNT_URL))
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));

    setDraftClaim(buildPartAdmissionClaim(YesNo.NO));
    await request(app)
      .get(route(CITIZEN_ALREADY_PAID_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you paid the claimant the amount you admit you owe?');
      });

    await request(app)
      .post(route(CITIZEN_ALREADY_PAID_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));

    await request(app)
      .get(route(RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How much money do you admit you owe?');
      });

    await request(app)
      .get(route(CITIZEN_OWED_AMOUNT_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How much money do you admit you owe?');
      });

    await request(app)
      .post(route(CITIZEN_OWED_AMOUNT_URL))
      .send({amount: 400})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));

    setDraftClaim(buildPartAdmissionClaim(YesNo.NO, 400));
    await request(app)
      .get(route(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('When do you want to pay the £400.00?');
      });

    await request(app)
      .post(route(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL))
      .send({paymentType: PaymentOptionType.IMMEDIATELY})
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));
  });
});
