import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  DQ_CONFIRM_YOUR_DETAILS_URL,
  DQ_DEFENDANT_WITNESSES_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

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
      await request(app).get(DQ_CONFIRM_YOUR_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await request(app)
        .get(DQ_CONFIRM_YOUR_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {

    it('should return confirm your details evidence page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
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
      const _mockSaveData = {
        firstName: '',
        lastName: '',
        emailAddress: 'test',
        phoneNumber: 'test',
        jobTitle: '',
      };
      await request(app).post(DQ_CONFIRM_YOUR_DETAILS_URL)
        .send(_mockSaveData)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      const _mockSaveData = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'test@test.com',
        phoneNumber: '600000000',
        jobTitle: 'Doctor',
      };
      await request(app)
        .post(DQ_CONFIRM_YOUR_DETAILS_URL)
        .send(_mockSaveData)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
