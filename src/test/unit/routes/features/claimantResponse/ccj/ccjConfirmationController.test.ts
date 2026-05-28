import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CCJ_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {civilClaimResponseMock, mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('routes/guards/ccjConfirmationGuard', () => ({
  ccjConfirmationGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockJudgmentRequestedCivilClaim = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    ...civilClaimResponseMock,
    state: CaseState.JUDGMENT_REQUESTED,
    case_data: {
      ...civilClaimResponseMock.case_data,
      ccdState: CaseState.JUDGMENT_REQUESTED,
    },
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

describe('CCJ confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(() => {
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      jest.spyOn(launchDarkly, 'isJudgmentBufferEnabled').mockResolvedValue(false);
    });

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
    it('should return ccj confirmation page when judgment requested and judgment buffer is enabled', async () => {
      jest.spyOn(Claim.prototype, 'isCCJCompleteForJo').mockReturnValue(false);
      jest.spyOn(launchDarkly, 'isJudgmentBufferEnabled').mockResolvedValueOnce(true);
      app.locals.draftStoreClient = mockJudgmentRequestedCivilClaim;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.CCJ_CONFIRMATION_JUDGMENT_REQUESTED);
      expect(res.text).not.toContain(TestMessages.CCJ_CONFIRMATION_PROCESS_YOUR_REQUEST);
      expect(res.text).not.toContain(TestMessages.CCJ_CONFIRMATION_PROCESS_YOUR_REQUEST_1);
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_CONFIRMATION_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
