import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {
  DQ_CONFIRM_YOUR_DETAILS_URL,
  DQ_DEFENDANT_WITNESSES_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const mockSaveData = {
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'test@test.com',
  phoneNumber: '600000000',
  jobTitle: 'Doctor',
};

describe('Confirm your details evidence Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return confirm your details evidence page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_CONFIRM_YOUR_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_CONFIRM_YOUR_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return confirm your details evidence page', async () => {
      await request(app).post(DQ_CONFIRM_YOUR_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
    });

    it('should redirect to witnesses page', async () => {
      await request(app).post(DQ_CONFIRM_YOUR_DETAILS_URL)
        .send(mockSaveData)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_DEFENDANT_WITNESSES_URL);
        });
    });

    it('should return error when some of the fields contains validation errors', async () => {
      const _mockSaveData = mockSaveData;
      _mockSaveData.firstName = '';
      _mockSaveData.lastName = '';
      _mockSaveData.emailAddress = 'test';
      _mockSaveData.phoneNumber = 'test';
      _mockSaveData.jobTitle = '';
      await request(app).post(DQ_CONFIRM_YOUR_DETAILS_URL)
        .send(_mockSaveData)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_CONFIRM_YOUR_DETAILS_URL)
        .send(mockSaveData)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
