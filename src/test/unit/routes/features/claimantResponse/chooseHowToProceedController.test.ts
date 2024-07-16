import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn().mockResolvedValue({ isClaimantIntentionPending: () => true }),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Choose how to proceed Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return intention to proceed page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CLAIMANT_FORMALISE_REPAYMENT_TYPE.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.SELECT_AN_OPTION'));
      });
    });

    it('should redirect to the claimant response task-list if option SIGN_A_SETTLEMENT_AGREEMENT is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL).send({option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response task-list if option REQUEST_A_CCJ is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL).send({option: ChooseHowProceed.REQUEST_A_CCJ})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
