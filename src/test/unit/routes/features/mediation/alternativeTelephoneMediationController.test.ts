import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Mediation} from 'models/mediation/mediation';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_ALTERNATIVE_PHONE_URL;
const TELEPHONE_NUMBER = '01632960001';
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
      mediation.alternativeMediationTelephone = {
        alternativeTelephone: TELEPHONE_NUMBER,
      };
      claim.mediation = mediation;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return Alternative Telephone Mediation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_ALTERNATIVE_TELEPHONE);
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
    it('should redirect to the mediation dates confirmation page ', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeTelephone: TELEPHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(MEDIATION_EMAIL_CONFIRMATION_URL);
        });
    });
    it('should Valid Telephone when is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeTelephone: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
        });
    });

    it('should should Valid telephone when is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeTelephone: 'aaa'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PHONE_NUMBER_UK);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({alternativeTelephone: TELEPHONE_NUMBER})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

afterAll(() => {
  global.gc && global.gc()
})

