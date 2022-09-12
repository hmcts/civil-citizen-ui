import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  FIRST_CONTACT_PIN_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from '../../../../../../main/routes/urls';
import {t} from 'i18next';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {CIVIL_SERVICE_VALIDATE_PIN_URL} from '../../../../../../main/app/client/civilServiceUrls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const mockFullClaim = { 'id': 1662129391355637, 'case_data': {}};
describe('Respond to Claim - Pin Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should display page successfully', async () => {

      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(FIRST_CONTACT_PIN_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.PIN.TITLE'));
        });
    });
  });

  describe('on POST', () => {
    it('should show error messages when empty pin', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should redirect to claim summary when pin and reference match', async () => {

      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(200, mockFullClaim);

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '0000' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_CLAIM_SUMMARY_URL);
        expect(app.request.cookies.firstContact.claimReference).toBe('000MC000');
        expect(app.request.cookies.firstContact.pinVerified).toBe(YesNo.YES);
      });
    });

    it('should redirect unauthorized page', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(401, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1234' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
      });
    });

    it('should show error messages when receive 400 status', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(400, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '111MC111' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1111' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should catch the exceptions', async () => {
      nock('http://localhost:4000')
        .post(CIVIL_SERVICE_VALIDATE_PIN_URL)
        .reply(500, {});

      app.locals.draftStoreClient = mockRedisFailure;
      app.request.cookies = { firstContact: { claimReference: 'error' } };
      await request(app)
        .post(FIRST_CONTACT_PIN_URL)
        .send({ pin: 'error' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
