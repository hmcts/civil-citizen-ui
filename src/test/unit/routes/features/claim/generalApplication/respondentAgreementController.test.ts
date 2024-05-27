import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { GA_RESPONDENT_AGREEMENT_URL } from 'routes/urls';
import { app } from '../../../../../../main/app';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('General Application - inform other parties', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationType = new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM);
    claim.generalApplication.response = {respondentAgreement: new RespondentAgreement()};
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_RESPONDENT_AGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'));
          expect(res.text.toLowerCase()).toContain(t('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE').toLowerCase());
        });
    });

    it('should return http 500 when has error in the get method', async () => {

      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_RESPONDENT_AGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should save the value and redirect', async () => {
      await request(app)
        .post(GA_RESPONDENT_AGREEMENT_URL)
        .send({ option: 'yes' })
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(GA_RESPONDENT_AGREEMENT_URL)
        .send({ option: null })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.NEED_TO_TELL'));
        });
    });
    it('should return errors when selected no and not provided the reason', async () => {
      await request(app)
        .post(GA_RESPONDENT_AGREEMENT_URL)
        .send({ option: 'no' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .post(GA_RESPONDENT_AGREEMENT_URL)
        .send({ option: 'yes' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});