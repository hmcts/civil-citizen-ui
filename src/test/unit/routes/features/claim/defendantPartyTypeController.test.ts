import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {PartyType} from 'models/partyType';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_PARTY_TYPE_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Defendant party type controller', () => {
  const mockGetClaim = getCaseDataFromStore as jest.Mock;
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    mockGetClaim.mockImplementation(async () => {
      return new Claim();
    });
  });

  describe('on GET', () => {
    it('should display defendant party type page', async () => {
      const response = await request(app).get(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Who are you making the claim against?');
    });

    it('should return status 500 when error is thrown', async () => {
      mockGetClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should display defendant party type page if there is no selection', async () => {
      const response = await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Who are you making the claim against?');
    });

    it('should redirect to the defendant individual details if individual radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.INDIVIDUAL}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
      });
    });

    it('should redirect to the defendant company details if company radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.COMPANY}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
      });
    });

    it('should redirect to the sole trader details if sole trader radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.SOLE_TRADER}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
      });
    });

    it('should redirect to the organisation details if organisation radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.ORGANISATION}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
      });
    });

    it('should render page if non-existent party type is provided', async () => {
      await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({foo: 'blah'})
        .expect((response: Response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(TestMessages.CHOOSE_YOUR_RESPONSE);
        });
    });

    it('should return something went wrong page if redis failure occurs', async () => {
      const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({option: PartyType.ORGANISATION})
        .expect((response: Response) => {
          expect(response.status).toBe(500);
          expect(response.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
