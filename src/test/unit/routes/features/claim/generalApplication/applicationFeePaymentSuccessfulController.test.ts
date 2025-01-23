import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {GA_APPLICATION_SUBMITTED_URL, GA_PAYMENT_SUCCESSFUL_URL} from 'routes/urls';
import { Claim } from 'common/models/claim';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import * as draftService from 'modules/draft-store/draftStoreService';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { CaseProgressionHearing } from 'common/models/caseProgression/caseProgressionHearing';
import { t } from 'i18next';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { PaymentInformation } from 'common/models/feePayment/paymentInformation';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  getApplicationFromGAService: jest.fn(),
  shouldDisplaySyncWarning: jest.fn(),
}));
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claim fee payment confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
  let applicationResponse: ApplicationResponse;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationFeePaymentDetails = new PaymentInformation();
    claim.generalApplication.applicationFeePaymentDetails.paymentReference = 'REF-123-123';
    claim.caseProgressionHearing = new CaseProgressionHearing();

    applicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: {
          fee: undefined,
          paymentDetails: {
            status: 'SUCCESS',
            reference: 'REF-123-123',
          },
          additionalPaymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          serviceRequestReference: undefined,
        },
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '',
      last_modified: '',
      state: undefined,
    };
  });

  describe('on GET', () => {
    it('should return resolving successful payment page', async () => {
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM)];
      mockDataFromStore.mockResolvedValueOnce(claim);
      await request(app)
        .get(GA_PAYMENT_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('REF-123-123');
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_1'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_2'));
        });

    });
    it('should return resolving successful application submitted', async () => {
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)];
      claim.caseProgressionHearing.hearingDate = new Date('2026-01-01');
      mockDataFromStore.mockResolvedValueOnce(claim);
      await request(app)
        .get(GA_APPLICATION_SUBMITTED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Application Submitted');
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT'));
        });

    });

    it('should return error if there is no claim fee data', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_PAYMENT_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
