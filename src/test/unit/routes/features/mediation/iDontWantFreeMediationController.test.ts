import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {RESPONSE_TASK_LIST_URL, DONT_WANT_FREE_MEDIATION_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  civilClaimResponseMock,
} from '../../../../utils/mockDraftStore';
import {NoMediationReasonOptions} from 'form/models/mediation/noMediationReasonOptions';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import civilClaimResponseApplicantWithMediation
  from '../../../../utils/mocks/civilClaimResponseApplicanWithMediationMock.json';
import noRespondentTelephoneClaimantIntentionMock
  from '../../../../utils/mocks/noRespondentTelephoneClaimantIntentionMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('I dont want free meditation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return I dont want free meditation page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(DONT_WANT_FREE_MEDIATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_I_DONT_WANT_FREE);
        });
    });
    it('should return mediation disagreement page when mediation has mediationDisagreement', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .get(DONT_WANT_FREE_MEDIATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_I_DONT_WANT_FREE);
          expect(res.text).toContain(NoMediationReasonOptions.ALREADY_TRIED);
          expect(res.text).toContain(NoMediationReasonOptions.JUDGE_TO_DECIDE);
          expect(res.text).toContain(NoMediationReasonOptions.NO_DELAY_IN_HEARING);
          expect(res.text).toContain(NoMediationReasonOptions.NOT_SURE);
          expect(res.text).toContain(NoMediationReasonOptions.WOULD_NOT_SOLVE);
          expect(res.text).toContain(NoMediationReasonOptions.OTHER);
          expect(res.text).toContain('You have chosen not to try free mediation. Please tell us why:');
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DONT_WANT_FREE_MEDIATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when OTHER', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.OTHER, otherReason: 'Other reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when NOT_SURE', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.NOT_SURE, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when WOULD_NOT_SOLVE', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.WOULD_NOT_SOLVE, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when JUDGE_TO_DECIDE', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.JUDGE_TO_DECIDE, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when ALREADY_TRIED', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.ALREADY_TRIED, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when NO_DELAY_IN_HEARING', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantWithMediation.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.NO_DELAY_IN_HEARING, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when Claimant Response journey', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.NO_DELAY_IN_HEARING, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.OPTION_REQUIRED);
        });
    });
    it('should return error when no reason enter', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.OTHER, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SPECIFY_A_REASON);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DONT_WANT_FREE_MEDIATION_URL)
        .send({disagreeMediationOption: NoMediationReasonOptions.NO_DELAY_IN_HEARING, otherReason: ''})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
