import { GA_RESPONSE_CHECK_ANSWERS_URL } from 'routes/urls';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { app } from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import { getCaseDataFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import { YesNo } from 'common/form/models/yesNo';
import { HearingSupport, SupportType } from 'common/models/generalApplication/hearingSupport';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { StatementOfTruthForm } from 'common/models/generalApplication/statementOfTruthForm';
import { submitApplicationResponse } from 'services/features/generalApplication/response/submitApplicationResponse';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/response/submitApplicationResponse');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockSubmitApplicationResponse = submitApplicationResponse as jest.Mock;

describe('General application - response - check your answers', () => {

  beforeEach(() => {
    jest.resetAllMocks();
    nock(config.get('idamUrl'))
      .post('/o/token')
      .reply(200, {id_token: config.get('citizenRoleToken')});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
    mockSubmitApplicationResponse.mockResolvedValue(undefined);
  });

  afterAll(() => jest.clearAllMocks());

  describe('on GET', () => {

    it('displays claim summary', async () => {
      mockGetCaseData.mockResolvedValueOnce(new Claim());

      await request(app)
        .get(GA_RESPONSE_CHECK_ANSWERS_URL.replace(':id', '1234567'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.CLAIM_REFERENCE'));
          expect(res.text).toContain('1234 567');
        });
    });

    it('displays response data', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      const gaResponse = new GaResponse();
      claim.generalApplication.response = gaResponse;
      gaResponse.respondentAgreement = new RespondentAgreement(YesNo.YES);
      gaResponse.hearingSupport = new HearingSupport([SupportType.HEARING_LOOP]);
      mockGetCaseData.mockResolvedValueOnce(claim);

      await request(app)
        .get(GA_RESPONSE_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(GA_RESPONSE_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('submits statement of truth', async () => {
      mockGetCaseData.mockResolvedValueOnce(new Claim());
      mockGenerateRedisKey.mockReturnValue('123');
      const mockSaveDraftClaim = jest.spyOn(draftService, 'saveDraftClaim');
      const statementOfTruth: StatementOfTruthForm = {signed: true, name: 'Mr Applicant'};
      const gaResponse = new GaResponse();
      gaResponse.statementOfTruth = statementOfTruth;

      await request(app)
        .post(GA_RESPONSE_CHECK_ANSWERS_URL)
        .send(statementOfTruth)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(mockSaveDraftClaim).toBeCalledTimes(1);
          expect(mockSaveDraftClaim).toBeCalledWith('123', {
            generalApplication: {
              ...new GeneralApplication(),
              response: gaResponse,
            },
          });
        });
    });
    it('should show validation errors when statement of truth not filled in', async () => {
      mockGetCaseData.mockResolvedValueOnce(new Claim());

      await request(app)
        .post(GA_RESPONSE_CHECK_ANSWERS_URL)
        .send({signed: undefined, name: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'));
          expect(res.text).toContain(t('ERRORS.SIGNER_NAME_REQUIRED'));
        });
    });

  });
});
