import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {ApplicationType, ApplicationTypeOption, LinKFromValues} from 'common/models/generalApplication/applicationType';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { getClaimById } from 'modules/utilityService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECT_TYPE.TITLE'));
        });
    });
    it('should delete GA when url contains start', async () => {
      const spyDelete = jest.spyOn(generalApplicationService, 'deleteGAFromClaimsByUserId');
      (getClaimById as jest.Mock).mockResolvedValueOnce(new Claim());
      await request(app)
        .get(APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(spyDelete).toBeCalled();
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
        .send({option: ApplicationTypeOption.OTHER, optionOther: ApplicationTypeOption.PROCEEDS_IN_HERITAGE})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
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
        .post(APPLICATION_TYPE_URL)
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
