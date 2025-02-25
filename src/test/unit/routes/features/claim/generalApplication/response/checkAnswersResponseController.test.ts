import {GA_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {generateRedisKeyForGA, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService
  from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {Claim} from 'common/models/claim';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {RespondentAgreement} from 'common/models/generalApplication/response/respondentAgreement';
import {YesNo} from 'common/form/models/yesNo';
import {HearingSupport, SupportType} from 'common/models/generalApplication/hearingSupport';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'common/models/generalApplication/statementOfTruthForm';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {submitApplicationResponse} from 'services/features/generalApplication/response/submitApplicationResponse';
import {getClaimById} from 'modules/utilityService';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CaseRole} from 'form/models/caseRoles';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/response/submitApplicationResponse');

jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = generateRedisKeyForGA as jest.Mock;
const mockSubmitApplicationResponse = submitApplicationResponse as jest.Mock;
const mockGetClaimId = getClaimById as jest.Mock;

describe('General application - response - check your answers', () => {

  beforeEach(() => {
    jest.resetAllMocks();
    nock(config.get('idamUrl'))
      .post('/o/token')
      .reply(200, {id_token: config.get('citizenRoleToken')});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
    mockSubmitApplicationResponse.mockResolvedValue(undefined);
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
    mockGetClaimId.mockResolvedValue(claim);
  });

  afterAll(() => jest.clearAllMocks());

  describe('on GET', () => {

    it('displays claim summary', async () => {
      const mockClaim = new Claim();
      const gaResponse = new GaResponse();
      gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      gaResponse.hasUnavailableDatesHearing = YesNo.YES;
      mockGetCaseData.mockResolvedValueOnce(mockClaim);
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('1234567', '345', GA_RESPONSE_CHECK_ANSWERS_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
          expect(res.text).toContain(t('COMMON.CASE_REFERENCE', {claimId: caseNumberPrettify('1234567')}));
          expect(res.text).toContain('1234 567');
        });
    });

    it('displays response data', async () => {
      const gaResponse = new GaResponse();
      gaResponse.respondentAgreement = new RespondentAgreement(YesNo.YES);
      gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      gaResponse.hearingSupport = new HearingSupport([SupportType.HEARING_LOOP]);
      gaResponse.hasUnavailableDatesHearing = YesNo.NO;
      const mockClaim = new Claim();
      mockGetCaseData.mockResolvedValueOnce(mockClaim);
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);

      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('1234567', '345', GA_RESPONSE_CHECK_ANSWERS_URL))
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
      const mockSaveDraftClaim = jest.spyOn(gaStoreResponseService, 'saveDraftGARespondentResponse');
      const statementOfTruth: StatementOfTruthForm = {signed: true, name: 'Mr Applicant'};
      const gaResponse = new GaResponse();
      gaResponse.statementOfTruth = statementOfTruth;
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('1234567', '345', GA_RESPONSE_CHECK_ANSWERS_URL))
        .send(statementOfTruth)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(mockSaveDraftClaim).toBeCalledTimes(1);
          expect(mockSaveDraftClaim).toBeCalledWith('123', gaResponse);
        });
    });

    it('should send the value and redirect with title if business', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      claim.caseRole = CaseRole.APPLICANTSOLICITORONE;
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
      mockGetCaseData.mockImplementation(async () => claim);
      mockGenerateRedisKey.mockReturnValue('123');
      const mockSaveDraftClaim = jest.spyOn(gaStoreResponseService, 'saveDraftGARespondentResponse');
      const statementOfTruth: QualifiedStatementOfTruth = {signed: true, name: 'Mr Applicant', title: 'director'};
      const gaResponse = new GaResponse();
      gaResponse.statementOfTruth = statementOfTruth;
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('1234567', '345', GA_RESPONSE_CHECK_ANSWERS_URL))
        .send({signed: 'yes', name: 'Mr Applicant', title: 'director'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(mockSaveDraftClaim).toBeCalledTimes(1);
          expect(mockSaveDraftClaim).toBeCalledWith('123', gaResponse);
        });
    });

    it('should show validation errors when statement of truth not filled in', async () => {
      mockGetCaseData.mockResolvedValueOnce(new Claim());
      const gaResponse = new GaResponse();
      gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      gaResponse.hasUnavailableDatesHearing = YesNo.YES;
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);
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
