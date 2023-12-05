import request from 'supertest';
import {app} from '../../../../../../main/app';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {t} from 'i18next';

describe('Try the new online service', () => {

  describe('on GET', () => {
    it('should return Try the new online service page', async () => {
      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
        });
    });
  });

});
