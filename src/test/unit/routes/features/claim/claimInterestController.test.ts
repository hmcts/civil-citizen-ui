import config from 'config';
import nock from 'nock';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_HELP_WITH_FEES, CLAIM_INTEREST, CLAIM_INTEREST_TYPE} from '../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {t} from 'i18next';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {VALID_YES_NO_SELECTION} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/response/citizenDetails/citizenDetailsService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Claim Interest page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.resetAllMocks();
  });

  describe('on GET', () => {
    //TODO: failing
    it('should return on claim interest page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_INTEREST)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_INTEREST)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    //TODO: failing
    it('should redirect to the How do you want to claim interest screen when option is Yes', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST)
        .send({option : YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_INTEREST_TYPE);
        });
    });

    //TODO: failing
    it('should redirect to the Help with fees reference number screen when option is No', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST)
        .send({option : YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_HELP_WITH_FEES);
        });
    });

    it('should return error message when no option selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_SELECTION);
        });
    });

      it('should return http 500 when has error in the post method', async () => {
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_INTEREST)
        .send({option : YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
