import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_DISAGREEMENT_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  CAN_WE_USE_URL,
  CAN_WE_USE_COMPANY_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {CaseState} from 'form/models/claimDetails';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const applicantTypeMock = require('./applicantTypeMock.json');

describe('Mediation Disagreement', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return mediation disagreement page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_DISAGREEMENT);
        });
    });
    it('should return mediation disagreement page when mediation has mediationDisagreement', async () => {
      applicantTypeMock.case_data.mediation.mediationDisagreement = {option: YesNo.YES};
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_DISAGREEMENT);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when NO', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DONT_WANT_FREE_MEDIATION_URL);
        });
    });
    it('should redirect page when YES and applicant type is INDIVIDUAL', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.INDIVIDUAL;
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_URL);
        });
    });
    it('should redirect page when YES and applicant type is SOLE TRADER', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.SOLE_TRADER;
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_URL);
        });
    });
    it('should redirect page when YES and applicant type is ORGANISATION', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.ORGANISATION;
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should redirect page when YES and applicant type is COMPANY', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.COMPANY;
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should redirect page when YES and applicant type is COMPANY - from claimant response without mediation object on the case data', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.COMPANY;
      applicantTypeMock.case_data.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      applicantTypeMock.case_data.claimantResponse = new ClaimantResponse();
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should redirect page when YES and applicant type is COMPANY - from claimant response with mediation object on the case data', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.COMPANY;
      applicantTypeMock.case_data.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      applicantTypeMock.case_data.claimantResponse = new ClaimantResponse();
      applicantTypeMock.case_data.claimantResponse.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '6000000'}, {option: YesNo.YES});
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), applicantTypeMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Choose option: Yes or No');
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
