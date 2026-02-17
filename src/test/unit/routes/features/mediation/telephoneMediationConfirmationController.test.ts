import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL, MEDIATION_EMAIL_CONFIRMATION_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {CCDClaim, CivilClaimResponse} from 'models/civilClaimResponse';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_PHONE_CONFIRMATION_URL;
describe('Mediation Email Mediation Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockDraftClaimFromStore = draftStoreService.getDraftClaimFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = {phone: '111111'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      return claim;
    });
    mockDraftClaimFromStore.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = {phone: '111111'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      const civilClaimResponse = new CivilClaimResponse();
      civilClaimResponse.case_data = claim as unknown as CCDClaim;
      return civilClaimResponse;
    });
  });

  describe('on GET', () => {
    it('should return Email Mediation Confirmation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_PHONE_CONFIRMATION);
        });
    });

    it('should support explicit language query parameter', async () => {
      await request(app)
        .get(`${CONTROLLER_URL}?lang=en`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_PHONE_CONFIRMATION);
        });
    });

    it('should return claimant mediation phone confirmation page when claimant response is pending', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = {phone: '444444'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
        return claim;
      });
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = {phone: '444444'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('444444');
        });
    });

    it('should preselect option when mediation phone answer already exists', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.partyPhone = {phone: '111111'};
        claim.mediationCarm = new MediationCarm(undefined, undefined, undefined, undefined, new GenericYesNo('yes'));
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('checked');
        });
    });

    it('should use string partyPhone when returned as a string value', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        Object.assign(claim.respondent1, {partyPhone: '222222'});
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('222222');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    describe('claimant response', () => {
      beforeEach(() => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.applicant1 = new Party();
          claim.applicant1.partyPhone = {phone: '111111'};
          claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
          jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
          return claim;
        });
        mockDraftClaimFromStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.applicant1 = new Party();
          claim.applicant1.partyPhone = {phone: '111111'};
          claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
          const civilClaimResponse = new CivilClaimResponse();
          civilClaimResponse.case_data = claim as unknown as CCDClaim;
          return civilClaimResponse;
        });
      });

      it('should redirect page when NO', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_PHONE_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_EMAIL_CONFIRMATION_URL);
          });
      });
    });
    describe('defendant response', () => {
      it('should redirect page when NO', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_PHONE_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_EMAIL_CONFIRMATION_URL);
          });
      });
    });
    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select if the mediator can call you on 111111 for your mediation appointment or not');
        });
    });

    it('should use claimant fallback phone number when claimant party phone is missing', async () => {
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
        const claimantResponse = new ClaimantResponse();
        const mediation = new Mediation();
        mediation.canWeUse = {mediationPhoneNumber: '333333'};
        claimantResponse.mediation = mediation;
        claim.claimantResponse = claimantResponse;
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select if the mediator can use 333333 to call you for your mediation appointment or not');
        });
    });

    it('should return claimant validation error without placeholder when no claimant phone source exists', async () => {
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
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('for your mediation appointment or not');
          expect(res.text).not.toContain('[number]');
        });
    });

    it('should return defendant validation error without placeholder when defendant party is missing', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = {} as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('for your mediation appointment or not');
          expect(res.text).not.toContain('[phone number]');
        });
    });

    it('should not render [phone number] placeholder when no phone value is available', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
        const civilClaimResponse = new CivilClaimResponse();
        civilClaimResponse.case_data = claim as unknown as CCDClaim;
        return civilClaimResponse;
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('for your mediation appointment or not');
          expect(res.text).not.toContain('[phone number]');
        });
    });

    it('should return empty phone when draft case data is unavailable', async () => {
      mockDraftClaimFromStore.mockImplementation(async () => {
        return new CivilClaimResponse();
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('[phone number]');
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
