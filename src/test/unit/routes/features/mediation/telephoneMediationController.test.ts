import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL, TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Telephone Mediation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

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
      claim.respondent1.type = PartyType.ORGANISATION;
      claim.respondent1.partyPhone = {phone: '111111'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return telephone mediation page successfully when applicant is business and defendant', async () => {
      await request(app).get(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('telephone mediation');
      });
    });

    it('should return telephone mediation page successfully when applicant is business and claimant', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.type = PartyType.ORGANISATION;
        claim.caseRole = CaseRole.CLAIMANT;
        claim.applicant1.partyPhone = {phone: '111111'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      await request(app).get(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('telephone mediation');
      });
    });

  });

  describe('on POST', () => {
    describe('defendant response', () => {
      it('should redirect to task-list page when the user hit into continue button', async () => {
        await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
      });
    });

    describe('claimant response', () => {
      beforeEach(() => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.applicant1 = new Party();
          claim.applicant1.type = PartyType.ORGANISATION;
          claim.applicant1.partyPhone = {phone: '111111'};
          claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
          return claim;
        });
      });
      it('should redirect to task-list page when the user hit into continue button', async () => {
        await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
      });
    });

    it('should return status 500 when there is Redis error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(TELEPHONE_MEDIATION_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

  });
});

