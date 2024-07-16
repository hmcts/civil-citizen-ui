import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL,
  MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

import {
  civilClaimResponseMock,
} from '../../../../utils/mockDraftStore';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import civilClaimResponseClaimantIntentMock from '../../../../utils/mocks/civilClaimResponseClaimantIntentionMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Mediation Contact Person Mediation Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseMock.case_data);
    });
  });

  describe('on GET', () => {
    it('should return Contact Person Confirmation page', async () => {
      await request(app)
        .get(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_CONTACT_PERSON_CONFIRMATION);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    describe('defendant response', () => {
      it('should redirect page when NO', async () => {
        await request(app)
          .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_PHONE_CONFIRMATION_URL);
          });
      });
    });

    describe('claimant response', () => {
      beforeEach(() => {
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseClaimantIntentMock.case_data);
        });
      });
      it('should redirect page when NO', async () => {
        await request(app)
          .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL);
          });
      });
      it('should redirect page when Yes', async () => {
        await request(app)
          .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
          .send({option: 'yes'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(MEDIATION_PHONE_CONFIRMATION_URL);
          });
      });
    });

    it('should return error on incorrect input', async () => {
      await request(app)
        .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
