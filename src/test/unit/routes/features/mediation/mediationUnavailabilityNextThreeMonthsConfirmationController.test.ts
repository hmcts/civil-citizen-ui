import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  MEDIATION_NEXT_3_MONTHS_URL, MEDIATION_UNAVAILABLE_SELECT_DATES_URL, RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_NEXT_3_MONTHS_URL;
describe('Mediation Unavailability Next Three Months Confirmation Controller', () => {
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
      let claim = new Claim();
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should open Mediation Unavailability Next Three Months Confirmation page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_UNAVAILABILITY_NEXT_THREE_MONTHS_CONFIRMATION);
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
    describe('defendant response', () => {
      it('should redirect to defendant response task-list when NO option is selected - defendant response', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });
    });

    describe('claimant response', () => {
      beforeEach(() => {
        mockGetCaseData.mockImplementation(async () => {
          let claim = new Claim();
          claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
          return claim;
        });
      });

      it('should redirect to claimant response task-list when NO option is selected - claimant response', async () => {
        await request(app)
          .post(CONTROLLER_URL)
          .send({option: 'no'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
          });
      });
    });
    it('should redirect Mediation Unavailability dates page when Yes is selected', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(MEDIATION_UNAVAILABLE_SELECT_DATES_URL);
        });
    });

    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
