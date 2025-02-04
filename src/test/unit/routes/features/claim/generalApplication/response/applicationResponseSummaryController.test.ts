import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { app } from '../../../../../../../main/app';
import { GA_APPLICATION_RESPONSE_SUMMARY_URL, GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { t } from 'i18next';
import { Claim } from 'models/claim';
import { isGaForLipsEnabled } from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { GaServiceClient } from 'client/gaServiceClient';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { decode } from 'punycode';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { ApplicationResponse, JudicialDecisionOptions } from 'common/models/generalApplication/applicationResponse';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('General Application - Application response summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    const applicationMock: ApplicationResponse = {
      id: '1234567890',
      case_data: {
        applicationTypes: 'Adjourn a hearing',
        generalAppType: null,
        generalAppRespondentAgreement: null,
        generalAppInformOtherParty: null,
        generalAppAskForCosts: null,
        generalAppDetailsOfOrder: null,
        generalAppReasonsOfOrder: null,
        generalAppEvidenceDocument: null,
        gaAddlDoc: null,
        generalAppHearingDetails: null,
        generalAppStatementOfTruth: null,
        generalAppPBADetails: null,
        applicationFeeAmountInPence: null,
        parentClaimantIsApplicant: null,
        judicialDecision: {
          decision: JudicialDecisionOptions.MAKE_AN_ORDER,
        },
      },
      state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
      last_modified: '2024-05-29T14:39:28.483971',
      created_date: '2024-05-29T14:39:28.483971',
    };

    it('should return page', async () => {
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '1234567890',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      jest
        .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([applicationMock]);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValue(ccdClaim);

      await request(app)
        .get(GA_APPLICATION_RESPONSE_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          const txt = decode(res.text);
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.TITLE'));
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION') + ' 1');
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.DETAILS'));
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.AWAITING_RESPONDENT_RESPONSE'));
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.IN_PROGRESS'));
          expect(txt).toContain(applicationMock.case_data.applicationTypes);
          expect(txt).toContain(applicationMock.id);
          expect(txt).toContain('29 May 2024, 2:39:28 pm');
          expect(txt).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.VIEW_APPLICATION'));
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
