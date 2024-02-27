import request from 'supertest';
import {app} from '../../../../../../main/app';
import { BASE_ELIGIBILITY_URL, CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL, MAKE_CLAIM } from 'routes/urls';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

describe('Try the new online service', () => {
  app.request.cookies = {eligibilityCompleted: false};

  describe('on GET', () => {
    it.each([
      [BASE_ELIGIBILITY_URL],
      [MAKE_CLAIM],
    ])('should return Try the new online service page when url is %s', async (url) => {
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
        });
    });

    it.each([
      [BASE_ELIGIBILITY_URL],
      [MAKE_CLAIM],
    ])('should redirect to the specified service if r2 flag is disabled when url is %s', async (url) => {
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(false);
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(BASE_ELIGIBILITY_URL);
        });
    });

    it.each([
      [BASE_ELIGIBILITY_URL],
      [MAKE_CLAIM],
    ])('should return redirect to bilingual preference page if eligibilty and user session is already present and url is %s', async (url ) => {
      app.request.cookies = {eligibilityCompleted:  true};
      app.request.session = { user : {id: 123}} as any;
      jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
      await request(app)
        .get(url)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
        });
    });
  });
});
