import { app } from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  GA_APPLICATION_SUBMITTED_URL,
  GA_CHECK_ANSWERS_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { t } from 'i18next';
import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import {
  ApplicationType,
  ApplicationTypeOption,
} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { getSummarySections } from 'services/features/generalApplication/checkAnswers/checkAnswersService';
import { CaseProgressionHearing } from 'models/caseProgression/caseProgressionHearing';
import { submitApplication } from 'services/features/generalApplication/submitApplication';
import { YesNo } from 'form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/generalApplication/checkAnswers/checkAnswersService');
jest.mock('../../../../../../main/services/features/generalApplication/submitApplication');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/routes/guards/checkYourAnswersGAGuard', () => ({
  checkYourAnswersGAGuard: jest.fn((req, res, next) => next()),
}));
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = saveDraftClaim as jest.Mock;
const mockedSummaryRows = getSummarySections as jest.Mock;
const mockSubmitApplication = submitApplication as jest.Mock;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - Check your answers', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Check your answers page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(GA_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_CHECK_ANSWERS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockSubmitApplication.mockImplementation(() => mockClaim);
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: 'yes', name: 'Mr Applicant'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to submitted page if adjourn hearing and more than 14 days and with consent', async () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + 16);
      mockClaim.caseProgressionHearing = new CaseProgressionHearing();
      mockClaim.caseProgressionHearing.hearingDate = futureDate;
      mockClaim.generalApplication.agreementFromOtherParty = YesNo.YES;
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: 'yes', name: 'Mr Applicant'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(GA_APPLICATION_SUBMITTED_URL);
        });
    });

    it('should redirect to confirmation page if adjourn hearing and more than 14 days but not with consent', async () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + 16);
      mockClaim.caseProgressionHearing = new CaseProgressionHearing();
      mockClaim.caseProgressionHearing.hearingDate = futureDate;
      mockClaim.generalApplication = new GeneralApplication();
      mockClaim.generalApplication.applicationFee = {
        calculatedAmountInPence: 25000,
      };
      mockClaim.generalApplication.agreementFromOtherParty = YesNo.NO;
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockSubmitApplication.mockResolvedValueOnce({generalApplications: [{id: '123456', value: {gaApp: 'yes'}}]});
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: 'yes', name: 'Mr Applicant'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(GENERAL_APPLICATION_CONFIRM_URL + '?appFee=250&id=123456');
        });
    });

    it('should show error message if statement of truth not completed', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: null, name: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.STATEMENT_OF_TRUTH_REQUIRED_MESSAGE'));
          expect(res.text).toContain(t('ERRORS.SIGNER_NAME_REQUIRED'));
        });
    });

    it('should add the id in the url of the ga application', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationFee = {
        calculatedAmountInPence: 25000,
      };
      mockGetCaseData.mockImplementation(async () => claim);
      mockSubmitApplication.mockResolvedValueOnce({generalApplications: [{id: '123456', value: {gaApp: 'yes'}}]});
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: 'yes', name: 'Mr Applicant'})
        .expect((res) => {
          expect(res.header.location).toBe(GENERAL_APPLICATION_CONFIRM_URL + '?appFee=250&id=123456');
          expect(res.status).toBe(302);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_CHECK_ANSWERS_URL)
        .send({signed: 'yes', name: 'Mr Applicant'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

