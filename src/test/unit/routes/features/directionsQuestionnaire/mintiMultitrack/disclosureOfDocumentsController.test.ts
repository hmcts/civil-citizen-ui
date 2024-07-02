import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  DisclosureOfDocuments,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = DQ_DISCLOSURE_OF_DOCUMENTS_URL;

function getClaim() {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.partyPhone = {phone: '111111'};
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  return claim;
}

describe('Disclosure Of Controller', () => {
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
    it('should open disclosure of documents page without value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should open disclosure of documents page with value', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        const documentsChosen = [];
        documentsChosen.push('ELECTRONIC_DOCUMENTS');
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.hearing = new Hearing();
        claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments(documentsChosen);
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

  describe('on POST - disclosure of documents', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = {phone: '111111'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
    });

    it('should redirect to claim documents to be considered page when is do not have selected any of option ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL);

        });
    });

    it('should redirect to claim documents to be considered page when is just ELECTRONIC_DOCUMENTS', async () => {
      const documentsChosen = [];
      documentsChosen.push('ELECTRONIC_DOCUMENTS');
      await request(app)
        .post(CONTROLLER_URL)
        .send({documentsTypeForm: documentsChosen})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_AGREEMENT_REACHED_URL);

        });
    });

    it('should redirect to claim documents to be considered page when NON_ELECTRONIC and ELECTRONIC_DOCUMENTS', async () => {
      const documentsChosen = [];
      documentsChosen.push('ELECTRONIC_DOCUMENTS');
      documentsChosen.push('NON_ELECTRONIC');
      await request(app)
        .post(CONTROLLER_URL)
        .send({documentsTypeForm: documentsChosen})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_AGREEMENT_REACHED_URL);

        });
    });

    it('should redirect to claim documents to be considered page when is NON_ELECTRONIC_DOCUMENTS', async () => {
      const documentsChosen = [];
      documentsChosen.push('NON_ELECTRONIC_DOCUMENTS');
      await request(app)
        .post(CONTROLLER_URL)
        .send({documentsTypeForm: documentsChosen})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const documentsChosen = [];
      documentsChosen.push('ELECTRONIC_DOCUMENTS');
      await request(app)
        .post(CONTROLLER_URL)
        .send({disclosureOfDocuments: documentsChosen})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
