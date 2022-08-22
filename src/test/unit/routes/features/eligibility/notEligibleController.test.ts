import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');

describe("You can't use this service", () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it("should return you can't use this service page", async () => {
      await request(app)
        .get(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You can’t use this service');
        });
    });
  });

  describe('on POST', () => {
    it('should return page not found', async () => {
      await request(app)
        .post(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL)
        .expect((res) => {
          expect(res.status).toBe(404);
          expect(res.text).toContain(TestMessages.PAGE_NOT_FOUND);
        });
    });
  });
});
