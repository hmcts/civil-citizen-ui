import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL, 
  DELAYED_FLIGHT_URL, 
  FLIGHT_DETAILS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {
  getClaimDetails,
  saveClaimDetails,
} from 'services/features/claim/details/claimDetailsService';
import {Claim} from 'models/claim';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {YesNo} from 'common/form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');

const mockClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

describe('Claim Details - Reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should return delayed flight page', async () => {
      mockClaimDetails.mockImplementation(async () => new Claim());
      await request(app)
        .get(DELAYED_FLIGHT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DELAYED_FLIGHT.CLAIMING_FOR_DELAYED'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockClaimDetails.mockImplementation(async () => {throw new Error(TestMessages.REDIS_FAILURE);});
      await request(app)
        .get(DELAYED_FLIGHT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect when Yes', async () => {
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(FLIGHT_DETAILS_URL);
        });
    });
    it('should redirect when No', async () => {
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        });
    });
    it('should return errors on no input', async () => {
      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockSaveClaimDetails.mockImplementation(async () => {throw new Error(TestMessages.REDIS_FAILURE);});
      await request(app)
        .post(DELAYED_FLIGHT_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
