import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CCJ_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('routes/guards/ccjConfirmationGuard', () => ({
  ccjConfirmationGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('CCJ confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return ccj confirmation page', async () => {
      jest.spyOn(Claim.prototype, 'isCCJCompleteForJo').mockReturnValue(false);
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_TITLE);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_PROCESS_YOUR_REQUEST);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_PROCESS_YOUR_REQUEST_1);
    });
    it('should return ccj confirmation page for JO', async () => {
      jest.spyOn(Claim.prototype, 'isCCJCompleteForJo').mockReturnValue(true);
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_TITLE);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_NO_LONGER_RESPONSE);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_PROCESS_YOUR_REQUEST_JO);
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
