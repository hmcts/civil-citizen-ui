import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockDraftClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {ApplicationType, ApplicationTypeOption, LinkFromValues} from 'common/models/generalApplication/applicationType';
import {isGaForLipsEnabled, isQueryManagementEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { getClaimById } from 'modules/utilityService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {
  SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM,
  SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM,
} from 'routes/guards/generalApplication/applicationTypeGuard';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('routes/guards/uploadRateLimitGuard', () => ({
  createUploadRateLimitGuard: jest.fn(),
}));
const isQueryManagementEnabledMock = isQueryManagementEnabled as jest.Mock;

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
    isQueryManagementEnabledMock.mockImplementation(() => false) ;
  });

  describe('on GET', () => {
    it('should QM caption', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      isQueryManagementEnabledMock.mockImplementation(() => true) ;
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Ask the court to change something on your case (make an application)');
        });
    });
    it('should return page', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECT_TYPE.TITLE'));
        });
    });

    it('should show validation error when application type is missing from a later GA screen', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .query({[SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM]: 'true'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.APPLICATION_TYPE_REQUIRED'));
        });
    });

    it('should show duplicate validation error when duplicate application type is selected', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.VARY_ORDER),
        new ApplicationType(ApplicationTypeOption.VARY_ORDER),
      ];
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .query({index: 1, [SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM]: 'true'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_DUPLICATE'));
        });
    });

    it('should delete GA when url contains start', async () => {
      const spyDelete = jest.spyOn(generalApplicationService, 'deleteGAFromClaimsByUserId');
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.start}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(spyDelete).toBeCalled();
        });
    });

    it('should delete GA when url contains start and isAskMoreTime', async () => {
      const spyDelete = jest.spyOn(generalApplicationService, 'deleteGAFromClaimsByUserId');
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.start}&isAskMoreTime=true`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(spyDelete).toBeCalled();
        });
    });

    it('should select application type if using back link', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.EXTEND_TIME)];
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      await request(app)
        .get(APPLICATION_TYPE_URL).query({index: 0})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECT_TYPE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      (getClaimById as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should send the value when select OTHER and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.OTHER_OPTION, optionOther: ApplicationTypeOption.OTHER})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should update existing application type instead of appending when revisiting without index', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.EXTEND_TIME)];
      app.locals.draftStoreClient = mockDraftClaim(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toContain('/general-application/agreement-from-other-party?index=0');
        });

      expect(claim.generalApplication.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
    });

    it('should append application type when add another application flow provides next index', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.EXTEND_TIME)];
      app.locals.draftStoreClient = mockDraftClaim(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      await request(app)
        .post(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.addAnotherApp}&index=1`)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toContain('/general-application/order-judge?index=1');
        });

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[1].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
    });

    it('should keep CYA change screen query params when changing one application in a multi-application CYA', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
        new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM),
      ];
      app.locals.draftStoreClient = mockDraftClaim(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      await request(app)
        .post(`${APPLICATION_TYPE_URL}?index=0&changeScreen=true`)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toContain('/general-application/order-judge?index=0&changeScreen=true');
        });

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
    });

    it('should update latest added application type when add another page is resubmitted without index', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
        new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM),
      ];
      app.locals.draftStoreClient = mockDraftClaim(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      await request(app)
        .post(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.addAnotherApp}`)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.headers.location).toContain('/general-application/order-judge?index=1');
        });

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[1].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
    });

    it('should return error when adding a duplicate application type', async () => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.VARY_ORDER)];
      app.locals.draftStoreClient = mockDraftClaim(claim);
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      await request(app)
        .post(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.addAnotherApp}&index=1`)
        .send({option: ApplicationTypeOption.VARY_ORDER})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_DUPLICATE'));
        });

      expect(claim.generalApplication.applicationTypes).toHaveLength(1);
    });

    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.APPLICATION_TYPE_REQUIRED'));
        });
    });

    it.each([
      [ApplicationTypeOption.SET_ASIDE_JUDGEMENT,'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_CANCEL_JUDGMENT'],
      [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT,'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_VARY_JUDGMENT'],
      [ApplicationTypeOption.SETTLE_BY_CONSENT,'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_SETTLING'],
    ])('should return restrict addition of another application type when addition application type is in not allowed', async (applicationType, errorMessage) => {
      claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM)];
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      claim = new Claim();
      await request(app)
        .post(APPLICATION_TYPE_URL + `?linkFrom=${LinkFromValues.addAnotherApp}`)
        .send({option: applicationType})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t(errorMessage));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .post(APPLICATION_TYPE_URL)
        .send({option: ApplicationTypeOption.ADJOURN_HEARING})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
