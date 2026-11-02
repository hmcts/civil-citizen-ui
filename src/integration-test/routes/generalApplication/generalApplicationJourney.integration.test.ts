import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {ApplicationTypeOption} from '../../../main/common/models/generalApplication/applicationType';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {Claim} from '../../../main/common/models/claim';
import {GaResponse} from '../../../main/common/models/generalApplication/response/gaResponse';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import * as launchDarklyClient from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {
  APPLICATION_TYPE_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_APPLICATION_COSTS_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_REQUESTING_REASON_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
  INFORM_OTHER_PARTIES_URL,
  ORDER_JUDGE_URL,
} from '../../../main/routes/urls';

const CLAIM_ID = '000MC123';
const APP_ID = 'GA-1001';
const CLAIM_REDIS_KEY = '12345';
const GA_REDIS_KEY = 'ga-12345';

const route = (url: string): string => url.replace(':id', CLAIM_ID).replace(':appId', APP_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.submittedDate = new Date('2026-01-02T09:00:00.000Z');
  claim.generalApplications = [{id: APP_ID}] as Claim['generalApplications'];
  claim.generalApplication = {
    applicationTypes: [{option: ApplicationTypeOption.EXTEND_TIME}],
  } as Claim['generalApplication'];
  return claim;
};

const buildGaResponse = (): GaResponse => {
  const response = new GaResponse();
  response.generalApplicationType = [ApplicationTypeOption.EXTEND_TIME];
  return response;
};

const setDraft = (claim: Claim, gaResponse: GaResponse) => {
  app.locals.draftStoreClient = {
    set: jest.fn(() => Promise.resolve({})),
    get: jest.fn((key: string) => Promise.resolve(
      key === GA_REDIS_KEY
        ? JSON.stringify(gaResponse)
        : JSON.stringify({id: claim.id, case_data: claim}),
    )),
    del: jest.fn(() => Promise.resolve({})),
    ttl: jest.fn(() => Promise.resolve(-1)),
    expireat: jest.fn(() => Promise.resolve({})),
  };
};

describe('Integration: general application applicant and respondent', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue(CLAIM_REDIS_KEY);
    jest.spyOn(draftStoreService, 'generateRedisKeyForGA').mockReturnValue(GA_REDIS_KEY);
  });

  beforeEach(() => {
    (launchDarklyClient.isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
    (civilServiceClientMock as unknown as {getGeneralApplicationFee: jest.Mock}).getGeneralApplicationFee =
      jest.fn().mockResolvedValue({calculatedAmountInPence: 11900, code: 'FEE0275', version: '1'});
    setDraft(buildClaim(), buildGaResponse());
  });

  it('shows a validation error when agreement from the other parties is not answered', async () => {
    await request(app)
      .post(route(GA_AGREEMENT_FROM_OTHER_PARTY_URL))
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Agreement from the other parties');
        expect(res.text).toContain('govuk-error-message');
        expect(res.text).toContain('You need to tell us if the other parties have agreed to this application');
      });
  });

  it('walks the applicant path from application type to hearing arrangements', async () => {
    await request(app)
      .get(route(APPLICATION_TYPE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Select application');
      });

    await request(app)
      .post(route(APPLICATION_TYPE_URL))
      .send({option: ApplicationTypeOption.EXTEND_TIME})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_AGREEMENT_FROM_OTHER_PARTY_URL));
      });

    await request(app)
      .get(route(GA_AGREEMENT_FROM_OTHER_PARTY_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Agreement from the other parties');
        expect(res.text).toContain('More time to do what is required by a court order');
      });

    await request(app)
      .post(route(GA_AGREEMENT_FROM_OTHER_PARTY_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(INFORM_OTHER_PARTIES_URL));
      });

    await request(app)
      .get(route(INFORM_OTHER_PARTIES_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Should the court inform the other parties about this application?');
      });

    await request(app)
      .post(route(INFORM_OTHER_PARTIES_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_APPLICATION_COSTS_URL));
      });

    await request(app)
      .get(route(GA_APPLICATION_COSTS_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('119');
      });

    await request(app)
      .get(route(GA_CLAIM_APPLICATION_COST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Application costs');
      });

    await request(app)
      .post(route(GA_CLAIM_APPLICATION_COST_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(ORDER_JUDGE_URL));
      });

    await request(app)
      .get(route(ORDER_JUDGE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What order do you want the judge to make?');
      });

    await request(app)
      .post(route(ORDER_JUDGE_URL))
      .send({text: 'More time to file documents'})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_REQUESTING_REASON_URL));
      });

    await request(app)
      .get(route(GA_REQUESTING_REASON_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Why are you requesting this order?');
      });

    await request(app)
      .post(route(GA_REQUESTING_REASON_URL))
      .send({text: 'The deadline is too short'})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_ADD_ANOTHER_APPLICATION_URL));
      });

    await request(app)
      .post(route(GA_ADD_ANOTHER_APPLICATION_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_WANT_TO_UPLOAD_DOCUMENTS_URL));
      });

    await request(app)
      .get(route(GA_WANT_TO_UPLOAD_DOCUMENTS_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to upload documents to support your application?');
      });

    await request(app)
      .post(route(GA_WANT_TO_UPLOAD_DOCUMENTS_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL));
      });

    await request(app)
      .get(route(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Application hearing arrangements');
      });
  });

  it('walks the respondent path from agreement to hearing preference', async () => {
    await request(app)
      .get(route(GA_RESPONDENT_AGREEMENT_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you agree that the court should make the order that the other parties have requested?');
      });

    await request(app)
      .post(route(GA_RESPONDENT_AGREEMENT_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL));
      });

    await request(app)
      .get(route(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to upload documents to support your response?');
      });

    await request(app)
      .post(route(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL))
      .send({option: YesNo.NO})
      .expect(302)
      .expect((res) => {
        expect(res.header.location).toContain(route(GA_RESPONDENT_HEARING_PREFERENCE_URL));
      });

    await request(app)
      .get(route(GA_RESPONDENT_HEARING_PREFERENCE_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Application hearing preferences');
      });
  });
});
