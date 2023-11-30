import {app} from '../../../../../../main/app';
import {t} from 'i18next';
import {HEARING_FEE_CONFIRMATION_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';

const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');
describe('Pay Hearing Fee Confirmation Screen Controller', () => {
  beforeAll((done) => {
    const idamUrl: string = config.get('idamUrl');
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});

    testSession
      .get('/oauth2/callback')
      .query('code=ABCD')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  it('should return expected confirmation pay hearing fee page when claim exists', async () => {
    //When
    await testSession.get(HEARING_FEE_CONFIRMATION_URL.replace(':id', '123'))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.TITLE'));
      });
  });
});
