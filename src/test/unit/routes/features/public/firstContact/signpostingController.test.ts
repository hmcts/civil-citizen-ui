import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
} from 'routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('connect-redis');

describe('Signposting Controller', () => {
  describe('on GET', () => {
    it('should render signposting page successfully', async () => {
      const res = await request(app).get(FIRST_CONTACT_SIGNPOSTING_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Respond to a money claim');
    });
  });
});
