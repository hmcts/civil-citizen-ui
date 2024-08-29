import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONSE_HEARING_SUPPORT_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {SupportType} from 'models/generalApplication/hearingSupport';
import {isGaForLipsEnabled} from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import * as utilityService from 'modules/utilityService';
import { Claim } from 'common/models/claim';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/utilityService');
jest.mock('../../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

const mockGetClaim = utilityService.getClaimById as jest.Mock;

describe('General Application Response- Hearing support', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });
  beforeEach(() => {
    const claim = new Claim();
    claim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];
    mockGetClaim.mockResolvedValueOnce(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONSE_HEARING_SUPPORT_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(GA_RESPONSE_HEARING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345', GA_RESPONSE_HEARING_SUPPORT_URL))
        .send({requiredSupport: [SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
          signLanguageContent: 'test1', languageContent: 'test2', otherContent: 'test3'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on box selected but no input', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345',GA_RESPONSE_HEARING_SUPPORT_URL))
        .send({requiredSupport: SupportType.OTHER_SUPPORT, signLanguageContent: '', languageContent: '', otherContent: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.MISSING_OTHER'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      jest.spyOn(gaStoreResponseService, 'saveDraftGARespondentResponse').mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_RESPONSE_HEARING_SUPPORT_URL)
        .send({requiredSupport: [SupportType.STEP_FREE_ACCESS, SupportType.HEARING_LOOP]})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
