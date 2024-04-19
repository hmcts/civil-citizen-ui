
import request from 'supertest';
import {app} from '../../../../../../main/server';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('First Contact Access Denied Controller', () => {
  describe('on GET', () => {
    it('should render First Contact Access Denied page successfully', async () => {
      const res = await request(app).get(FIRST_CONTACT_ACCESS_DENIED_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('You are not authorised to view the claim!');
    });
  });
});
