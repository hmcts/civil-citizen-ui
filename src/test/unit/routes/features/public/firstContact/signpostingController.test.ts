import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
} from 'routes/urls';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Signposting Controller', () => {
  describe('on GET', () => {
    it('should render signposting page successfully', async () => {
      const res = await request(app).get(FIRST_CONTACT_SIGNPOSTING_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PAGE_TITLE'));
    });
  });
});
