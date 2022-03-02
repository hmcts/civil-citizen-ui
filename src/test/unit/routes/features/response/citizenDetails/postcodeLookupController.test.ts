import { app } from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import { POSTCODE_LOOKUP_URL } from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const nock = require('nock');

describe('Postcode Lookup Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  test('should return list of addresses', async () => {
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=CV56GQ')
      .expect((req) => {
        expect(req.text).toContain('100070660705'); // uprn
        expect(req.text).toContain('5, HIGHLAND ROAD'); // buildingNumber and thoroughfareName
        expect(req.text).toContain('COVENTRY'); // postTown
        expect(req.text).toContain('CV5 6GQ'); // postcode
        expect(req.text).toContain('D'); // postcodeType
        expect(req.text).toContain('Point'); // type
        expect(req.text).toContain('431895'); // lat coordinates
        expect(req.text).toContain('278312'); // log coordinates
      });
  });

  test('should return list of addresses', async () => {
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=')
      .expect((res) => {
        expect(res.status).toBe(400);
      });
  });
});
