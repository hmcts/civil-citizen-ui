import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Mediation Email Mediation Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDraftClaimFromStore = draftStoreService.getDraftClaimFromStore as jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockDraftClaimFromStore.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.emailAddress = {emailAddress: 'test@test.com'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      const civilClaimResponse = new CivilClaimResponse();
      civilClaimResponse.case_data = claim as unknown as CCDClaim;
      return civilClaimResponse;
    });
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.emailAddress = {emailAddress: 'test@test.com'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return Email Mediation Confirmation page', async () => {
      await request(app)
        .get(MEDIATION_EMAIL_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_EMAIL_CONFIRMATION);
        });
    });

    it('should support explicit language query parameter', async () => {
      await request(app)
        .get(`${MEDIATION_EMAIL_CONFIRMATION_URL}?lang=en`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_EMAIL_CONFIRMATION);
        });
    });

    it('should return claimant mediation email confirmation page when claimant response is pending', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.emailAddress = {emailAddress: 'claimant-email@test.com'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
        return claim;
      });
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.emailAddress = {emailAddress: 'claimant-email@test.com'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .get(MEDIATION_EMAIL_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('claimant-email@test.com');
        });
    });

    it('should preselect option when mediation email answer already exists', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.emailAddress = {emailAddress: 'test@test.com'};
        claim.mediationCarm = new MediationCarm(undefined, undefined, new GenericYesNoCarmEmailConfirmation('yes'));
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        return claim;
      });

      await request(app)
        .get(MEDIATION_EMAIL_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('checked');
        });
    });

    it('should use partyEmail when emailAddress is not available', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        Object.assign(claim.respondent1, {partyEmail: 'party-email@test.com'});
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .get(MEDIATION_EMAIL_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('party-email@test.com');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(MEDIATION_EMAIL_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    describe('defendant response', () => {
      it('should redirect page when NO', async () => {
        await request(app)
          .post(MEDIATION_EMAIL_CONFIRMATION_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_EMAIL_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(MEDIATION_EMAIL_CONFIRMATION_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_NEXT_3_MONTHS_URL);
          });
      });
    });

    describe('claimant response', () => {
      beforeEach(() => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.applicant1 = new Party();
          claim.applicant1.emailAddress = {emailAddress: 'test@test.com'};
          claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
          return claim;
        });
      });
      it('should redirect page when NO', async () => {
        await request(app)
          .post(MEDIATION_EMAIL_CONFIRMATION_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_EMAIL_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(MEDIATION_EMAIL_CONFIRMATION_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_NEXT_3_MONTHS_URL);
          });
      });
    });

    it('should return error on incorrect input', async () => {
      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select if the mediation team can contact you on test@test.com about your mediation appointment or not');
        });
    });

    it('should use claimantUserDetails email for claimant response when applicant email is missing', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
        return claim;
      });
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.claimantUserDetails = {email: 'claimant-user@test.com', id: 'id-1'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select if the mediation team can contact you on claimant-user@test.com about your mediation appointment or not');
        });
    });

    it('should return claimant validation error without placeholder when no claimant email source exists', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
        return claim;
      });
      mockDraftClaimFromStore.mockImplementation(async () => {
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = {} as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('about your mediation appointment or not');
          expect(res.text).not.toContain('[email]');
        });
    });

    it('should return defendant validation error without placeholder when defendant party is missing', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = {} as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('about your mediation appointment or not');
          expect(res.text).not.toContain('[email]');
        });
    });

    it('should not render [email] placeholder when no email value is available', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('about your mediation appointment or not');
          expect(res.text).not.toContain('[email]');
        });
    });

    it('should return empty email when draft case data is unavailable', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        return new CivilClaimResponse();
      });

      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('[email]');
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(MEDIATION_EMAIL_CONFIRMATION_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
