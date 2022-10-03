import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS,
  CLAIM_DEFENDANT_PARTY_TYPE_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS,
} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Defendant party type controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should display defendant party type page', async () => {
      const response = await request(app).get(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Who are you making the claim against?');
    });

    it('should return status 500 when error is thrown', async () => {
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
        expect(response.header.location).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS);
      });
    });

    it('should redirect to the defendant company details if company radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.COMPANY}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS);
      });
    });

    it('should redirect to the sole trader details if sole trader radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.SOLE_TRADER}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS);
      });
    });

    it('should redirect to the organisation details if organisation radio is selected', async () => {
      await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL).send({option: PartyType.ORGANISATION}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_DEFENDANT_ORGANISATION_DETAILS);
      });
    });

    it('should render not found page if non-existent party type is provided', async () => {
      await request(app)
        .post(CLAIM_DEFENDANT_PARTY_TYPE_URL)
        .send({foo: 'blah'})
        .expect((response: Response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(TestMessages.CHOOSE_YOUR_RESPONSE);
        });
    });
  });
});
