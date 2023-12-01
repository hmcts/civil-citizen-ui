import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {DATE_PAID_URL, DATE_PAID_CONFIRMATION_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { t } from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('client/civilServiceClient');
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const mockSubmitEvent = civilServiceClient.submitClaimSettled as jest.Mock;

mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});
describe('Date Paid Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should render date paid page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(DATE_PAID_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_SETTLE_DATE.TITLE'));
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DATE_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render date paid page if there are form errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).post(DATE_PAID_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_SETTLE_DATE.TITLE'));
    });

    it('should redirect to the confirmation page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(DATE_PAID_URL)
        .send({day: 2, month: 3, year: 1980})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(DATE_PAID_CONFIRMATION_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DATE_PAID_URL)
        .send({day: 4, month: 5, year: 1952})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
