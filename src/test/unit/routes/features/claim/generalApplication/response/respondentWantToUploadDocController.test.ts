import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as gaStoreResponseService
  from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isGaForLipsEnabled} from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];

describe('General Application - Respondent want to upload document ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });
  beforeEach(() => {
    const mockGaResponse = new GaResponse();
    mockGaResponse.generalApplicationType = [];
    jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
  });

  describe('on GET', () => {
    it('should return Do you want to upload documents to support your response page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL)
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
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL))
        .type('form').send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should show error message if radio button not selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345',GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL))
        .type('form').send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC_YES_NO_SELECTION'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      jest.spyOn(gaStoreResponseService, 'saveDraftGARespondentResponse').mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL)
        .type('form').send({option:YesNo.NO })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

