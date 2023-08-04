import request from 'supertest';
import {app} from '../../../../../../main/app';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

describe("You can't use this service", () => {
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
