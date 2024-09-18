import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL} from 'routes/urls';
import {t} from 'i18next';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - ask proof of debt payment guidance', () => {
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
    it('should return ask proof of debt payment guidance page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);

          const decodedText = res.text.replace(/&#39;/g, "'");

          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PAGE_TITLE'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.TITLE'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_1'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_2'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_TITLE_1'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_3'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_4'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_TITLE_3'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_5'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.DATE_OF_PAYMENT'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.AMOUNT_PAID'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.CASE_NUMBER'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_TITLE_4'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_6'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_7'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_TITLE_5'));
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.ASK_FOR_PROOF_OF_DEBT_PAYMENT.PARA_8'));
        });
    });
  });
});

