
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
} from '../../../../../../main/routes/urls';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('First Contact Access Denied Controller', () => {
  describe('on GET', () => {
    it('should render First Contact Access Denied page successfully', async () => {
      const res = await request(app).get(FIRST_CONTACT_ACCESS_DENIED_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.FIRST_CONTACT_ACCESS_DENIED.TITLE'));
    });
  });
});
