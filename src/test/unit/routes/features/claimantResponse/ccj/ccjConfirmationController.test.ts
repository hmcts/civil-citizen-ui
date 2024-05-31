import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CCJ_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

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
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('County Court Judgment requested');
      expect(res.text).toContain('We’ll process your request and send a copy of the judgment to you and to'); //TODO add to testMessages
      expect(res.text).toContain('Please do not call the Court & Tribunal Service Centre (CTSC) about the progress of your request.'); //TODO add to testMessages
    });
    it('should return ccj confirmation page for JO', async () => {
      jest.mock('../../../../../../../src/main/common/models/claim', () => ({
        isCCJCompleteForJo: jest.fn().mockReturnValue(true),
      }));
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('County Court Judgment requested');
      expect(res.text).toContain('can no longer respond to your claim online.'); //TODO add to testMessages
      expect(res.text).toContain('We’ll process your request and you will receive notifications by email, you will be able to view the judgment via your dashboard and we\'ll also post a copy of the judgment to'); //TODO add to testMessages
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
