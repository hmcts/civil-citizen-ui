import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { GA_ACCEPT_DEFENDANT_OFFER_URL } from 'routes/urls';
import { app } from '../../../../../../../main/app';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import { YesNo } from 'common/form/models/yesNo';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';
import { decode } from 'punycode';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('General Application - Accept defendant offer', () => {
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
    claim.generalApplication.applicationTypes.push(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
    claim.generalApplication.response = {respondentAgreement: new RespondentAgreement()};
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE'));
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockDataFromStore.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should save the value when YES and redirect', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: YesNo.YES })
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should save the value when No and ACCEPT_INSTALMENTS and redirect', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ 
          option: YesNo.NO, 
          type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS, 
          amountPerMonth: 10, 
          reasonProposedInstalment: 'test',
        })
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should save the value when No and PROPOSE_BY_SET_DATE and redirect', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ 
          option: YesNo.NO, 
          type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE, 
          day: '1', 
          month: '1', 
          year: '2040', 
          reasonProposedSetDate: 'test',
        })        
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: null })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_ACCEPT'));
        });
    });

    it('should return errors when selected no and not provided the type', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: YesNo.NO })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_CHOOSE'));
        });
    });
    it('should return errors when type is ACCEPT_INSTALMENTS', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: YesNo.NO, type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_INSTALMENT'));
          expect(decode(res.text)).toContain(t('ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT'));
        });
    });
    it('should return errors when type is PROPOSE_BY_SET_DATE', async () => {
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: YesNo.NO, type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
          expect(decode(res.text)).toContain(t('ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockDataFromStore.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });      
      await request(app)
        .post(GA_ACCEPT_DEFENDANT_OFFER_URL)
        .send({ option: YesNo.YES })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});