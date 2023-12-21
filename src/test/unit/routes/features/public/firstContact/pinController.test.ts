import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
  FIRST_CONTACT_PIN_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const mockFullClaim = { 'id': 1662129391355637, 'case_data': {}};
describe('Respond to Claim - Pin Controller', () => {

  const civilServiceUrl = config.get<string>('services.civilService.url');

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
      nock(civilServiceUrl)
        .post('/assignment/reference/undefined')
        .reply(400);
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should redirect to claim summary when pin and reference match', async () => {
      nock(civilServiceUrl)
        .post('/assignment/reference/000MC000')
        .reply(200, mockFullClaim);

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '000033331111' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_CLAIM_SUMMARY_URL);
        expect(app.request.cookies.firstContact.claimReference).toBe('000MC000');
      });
    });

    it('should redirect to claim summary when pin and reference match for OCMC', async () => {
      nock(civilServiceUrl)
        .post('/assignment/reference/000MC000/ocmc')
        .reply(200, 'redirectUrl');

      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '00000001' }).expect((res) => {
        expect(res.header.location).toBe('redirectUrl');
        expect(res.status).toBe(302);
      });
    });

    it('should redirect unauthorized page', async () => {
      nock(civilServiceUrl)
        .post('/assignment/reference/000MC000')
        .reply(401, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '000MC000' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1234' }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
      });
    });

    it('should show error messages when receive 400 status', async () => {
      nock(civilServiceUrl)
        .post('/assignment/reference/111MC111')
        .reply(400, {});

      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = { firstContact: { claimReference: '111MC111' } };
      await request(app).post(FIRST_CONTACT_PIN_URL).send({ pin: '1111' }).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.ENTER_VALID_SECURITY_CODE'));
      });
    });

    it('should catch the exceptions', async () => {
      nock(civilServiceUrl)
        .post('/assignment/reference/error')
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
