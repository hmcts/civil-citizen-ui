import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from 'form/models/yesNo';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/mediation/unavailableDatesForMediationService');

const CONTROLLER_URL = DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL;

function getClaim(caseRole = CaseRole.DEFENDANT) {
  const claim = new Claim();
  claim.caseRole =  caseRole;
  claim.respondent1 = new Party();
  claim.respondent1.partyPhone = {phone: '111111'};
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  return claim;
}

describe('claimant Documents to be considered Controller', () => {
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
    it('should open Claimant documents to be considered page without value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant documents to be considered');
        });
    });

    it('should open Defendant documents to be considered page without value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim(CaseRole.CLAIMANT);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Defendant documents to be considered');
        });
    });

    it('should open Claimant documents to be considered page with yes', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant documents to be considered');
        });
    });

    it('should open Defendant documents to be considered page with yes', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim(CaseRole.CLAIMANT);
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.YES};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Defendant documents to be considered');
        });
    });

    it('should open Claimant documents to be considered page with no', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.NO};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant documents to be considered');
        });
    });

    it('should open Defendant documents to be considered page with no', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim(CaseRole.CLAIMANT);
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {option: YesNo.NO};
        return claim;
      });

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Defendant documents to be considered');
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

    it('should redirect when hasAnAgreementBeenReachedOptions is yes ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL);
        });
    });

    it('should redirect when hasAnAgreementBeenReachedOptions is NO', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_DEFENDANT_EXPERT_EVIDENCE_URL);
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
