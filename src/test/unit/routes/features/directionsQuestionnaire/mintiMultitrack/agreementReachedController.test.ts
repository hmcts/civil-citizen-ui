import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/mediation/unavailableDatesForMediationService');

const CONTROLLER_URL = DQ_MULTITRACK_AGREEMENT_REACHED_URL;

function getClaim() {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyPhone = {phone: '111111'};
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  return claim;
}

describe('Agreement Reached Controller', () => {
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
    it('should open Has an agreement been reached page without value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should open Has an agreement been reached page with value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.hasAnAgreementBeenReached = HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY;
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

    it('should redirect when hasAnAgreementBeenReachedOptions is yes and non-electronic option was chosen on previous page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments();
        claim.directionQuestionnaire.hearing.disclosureOfDocuments.documentsTypeChosen = [TypeOfDisclosureDocument.ELECTRONIC, TypeOfDisclosureDocument.NON_ELECTRONIC];
        return claim;
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({hasAnAgreementBeenReached: HasAnAgreementBeenReachedOptions.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL);

        });
    });

    it('should redirect when hasAnAgreementBeenReachedOptions is yes and non-electronic option was not chosen on previous page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments();
        claim.directionQuestionnaire.hearing.disclosureOfDocuments.documentsTypeChosen = [TypeOfDisclosureDocument.ELECTRONIC];
        return claim;
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({hasAnAgreementBeenReached: HasAnAgreementBeenReachedOptions.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL);

        });
    });

    it('should redirect when hasAnAgreementBeenReachedOptions is NO_BUT_AN_AGREEMENT_IS_LIKELY', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({hasAnAgreementBeenReached: HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL);
        });
    });

    it('should redirect when hasAnAgreementBeenReachedOptions is NO', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({hasAnAgreementBeenReached: HasAnAgreementBeenReachedOptions.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL);
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
        .send({hasAnAgreementBeenReached: 'test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
