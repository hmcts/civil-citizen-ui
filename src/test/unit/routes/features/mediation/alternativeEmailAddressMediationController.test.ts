import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Mediation} from 'models/mediation/mediation';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_ALTERNATIVE_EMAIL_URL;
describe('Mediation Email Mediation Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      const mediation = new Mediation();
      mediation.alternativeMediationEmail = {
        alternativeEmailAddress: 'test',
      };
      claim.mediation = mediation;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return Alternative Email Mediation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_ALTERNATIVE_EMAIL_ADDRESS);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to the mediation next 3 months confirmation page ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeEmailAddress: 'test@test.com'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(MEDIATION_NEXT_3_MONTHS_URL);
        });
    });
    it('should Valid email when is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeEmailAddress: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should should Valid email when is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeEmailAddress: 'aaa'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_EMAIL);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeEmailAddress: 'test@test.com'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

afterAll(() => {
  global.gc && global.gc();
});