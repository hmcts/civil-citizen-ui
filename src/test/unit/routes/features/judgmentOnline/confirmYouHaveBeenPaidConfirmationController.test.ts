import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

const CONTROLLER_URL = CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL;
describe('Confirm you have been paid confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return ConfirmYouHaveBeenPaidConfirmation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_PAGE_TITLE);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_YOU_CONFIRMED);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_WHAT_NEXT);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_NO_FURTHER);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_CLOSE_AND_RETURN);
        });
    });
  });
});
