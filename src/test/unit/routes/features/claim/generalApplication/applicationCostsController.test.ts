import {app} from '../../../../../../main/app';
import request from 'supertest';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, GA_APPLICATION_COSTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getApplicationCostsContent} from 'services/features/generalApplication/applicationCostsService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as utilityService from 'modules/utilityService';
import config from 'config';
import nock from 'nock';
import {isGaForLipsEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/services/features/generalApplication/applicationCostsService');
jest.mock('../../../../../../main/services/features/generalApplication/feeDetailsService');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('../../../../../../main/routes/guards/requireGeneralApplicationDraft',() => ({
  requireGeneralApplicationDraft: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetClaim = utilityService.getClaimById as jest.Mock;

describe('General Application - Application costs', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT));
      return claim;
    });
  });

  const mockContent = getApplicationCostsContent as jest.Mock;
  mockContent.mockImplementation(() => {
    return new PageSectionBuilder().build();
  });

  describe('on GET', () => {
    it('should return page', async () => {
      (gaApplicationFeeDetails as jest.Mock).mockResolvedValueOnce({
        calculatedAmountInPence: 1400,
        code: 'Fe124',
        version: 0,
      });
      await request(app)
        .get(GA_APPLICATION_COSTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetClaim.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLICATION_COSTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should redirect a claimant to the dashboard when generalApplication is missing', async () => {
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.caseRole = CaseRole.CLAIMANT;
        return claim;
      });
      await request(app)
        .get(GA_APPLICATION_COSTS_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL.replace(':id', '123'));
          expect(res.text).not.toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should redirect a defendant to the dashboard when applicationTypes is empty', async () => {
      mockGetClaim.mockImplementation(() => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      await request(app)
        .get(GA_APPLICATION_COSTS_URL.replace(':id', '123'))
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', '123'));
          expect(res.text).not.toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
