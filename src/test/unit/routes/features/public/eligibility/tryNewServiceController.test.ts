import request from 'supertest';
import {app} from '../../../../../../main/app';
import {BASE_ELIGIBILITY_URL, CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL} from 'routes/urls';
import {t} from 'i18next';

describe('Try the new online service', () => {
  app.request.cookies = {eligibilityCompleted: false};

  describe('on GET', () => {
    it('should return Try the new online service page', async () => {
      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        expect((res: { status: any; text: any; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
         });
    });

    it('should return redirect to bilingual preference page if eligibilty and user session is already present', async () => {
      app.request.cookies = {eligibilityCompleted:  true};
      app.request.session = { user : {id: 123}} as any;

      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        expect((res: { status: any; redirect: any; }) => {
          expect(res.status).toBe(302);
          expect(res.redirect).toBeCalledWith(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
         });
    });
  });
});
