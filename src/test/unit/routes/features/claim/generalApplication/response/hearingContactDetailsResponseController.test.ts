import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONSE_HEARING_CONTACT_DETAILS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {t} from 'i18next';
import { ApplicationTypeOption } from 'models/generalApplication/applicationType';
import {Claim} from 'common/models/claim';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockClaim = new Claim();
mockClaim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];

describe('General Application Response- Contact Details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });
  beforeEach(() => {
    jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('on GET', () => {
    it('should return Contact Details page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONSE_HEARING_CONTACT_DETAILS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_CONTACT_DETAILS.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONSE_HEARING_CONTACT_DETAILS_URL))
        .type('form').send({ telephoneNumber: '04432188664', emailAddress: 'test@gmail.com'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should show error message if no value entered', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONSE_HEARING_CONTACT_DETAILS_URL))
        .type('form').send({telephoneNumber: null, emailAddress: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'));
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      jest.spyOn(gaStoreResponseService, 'saveDraftGARespondentResponse').mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_RESPONSE_HEARING_CONTACT_DETAILS_URL)
        .type('form').send({ telephoneNumber: '04432188664', emailAddress: 'test@gmail.com' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

