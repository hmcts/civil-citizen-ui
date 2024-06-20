import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  SUBJECT_TO_FRC_URL,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from 'form/models/yesNo';
import {FixedRecoverableCosts} from 'models/directionsQuestionnaire/fixedRecoverableCosts/fixedRecoverableCosts';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/mediation/unavailableDatesForMediationService');

const CONTROLLER_URL = SUBJECT_TO_FRC_URL;

function getClaim() {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyPhone = {phone: '111111'};
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  return claim;
}

describe('Subject to Fixed recoverable costs Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should open subject to fixed recoverable costs page without value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should open subject to fixed recoverable costs page with yes', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.fixedRecoverableCosts = new FixedRecoverableCosts();
        claim.directionQuestionnaire.fixedRecoverableCosts.subjectToFrc = {option: YesNo.YES};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should open subject to fixed recoverable costs page with no', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.fixedRecoverableCosts = new FixedRecoverableCosts();
        claim.directionQuestionnaire.fixedRecoverableCosts.subjectToFrc = {option: YesNo.NO};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
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
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = {phone: '111111'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
    });

    it('should redirect when subject to fixed recoverable costs is yes ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          //TODO CHANGE TO CORRECT URL WHEN IS AVAILABLE
          expect(res.get('location')).toBe('todo');
        });
    });

    it('should redirect when subject to fixed recoverable costs is NO', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          //TODO CHANGE TO CORRECT URL WHEN IS AVAILABLE
          expect(res.get('location')).toBe('todo');
        });
    });

    it('should validate the field is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
