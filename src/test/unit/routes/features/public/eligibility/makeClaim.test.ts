import request from 'supertest';
import { app } from '../../../../../../main/app';
import { BASE_ELIGIBILITY_URL, MAKE_CLAIM } from 'routes/urls';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

describe('Try the make claim service', () => {
  describe('on GET', () => {
    it('should return Try the new online service page', async () => {
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(false);
      await request(app)
        .get(MAKE_CLAIM)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(BASE_ELIGIBILITY_URL);
        });
    });
  });

});
