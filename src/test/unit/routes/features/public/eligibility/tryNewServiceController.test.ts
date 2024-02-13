import request from 'supertest';
import {app} from '../../../../../../main/app';
import { BASE_ELIGIBILITY_URL, MAKE_CLAIM } from 'routes/urls';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

describe('Try the new online service', () => {

  describe('on GET', () => {
    it('should return Try the new online service page', async () => {
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
        });
    });
    it('should redirect to the specified service if r2 flag is disabled', async () => {
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(false);
      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
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
