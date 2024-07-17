import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {PAY_HEARING_FEE_SUCCESSFUL_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {Claim} from 'models/claim';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {t} from 'i18next';
import civilClaimResponseHearingFeeMock from '../../../../utils/mocks/civilClaimResponseHearingFeeMock.json';
import civilClaimResponseApplicantCompany from '../../../../utils/mocks/civilClaimResponseApplicantCompanyMock.json';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const spyDel = jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });
  describe('on GET', () => {
    it('should return resolving successful payment page', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      app.request.cookies = {lang: 'en'};
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseHearingFeeMock.case_data);
      });
      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing fee');
        });
    });
    it('should return resolving successful payment page in english', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseHearingFeeMock.case_data);
      });
      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE',{lng:'en'}));
          expect(res.text).toContain(t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_IS',{lng:'en'}));
          expect(res.text).toContain(t('COMMON.MICRO_TEXT.HEARING_FEE',{lng:'cy'}));
        });
    });
    it('should return resolving successful payment page in welsh', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      app.request.cookies = {lang: 'cy'};
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseHearingFeeMock.case_data);
      });
      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.CONFIRMATION',{lng:'cy'}));
          expect(res.text).toContain(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAYMENT_SUMMARY',{lng:'cy'}));
          expect(res.text).toContain(t('COMMON.MICRO_TEXT.HEARING_FEE',{lng:'cy'}));
        });
    });

    it('should return error if there is no case progression data', async () => {
      app.request.cookies = {lang: 'en'};
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseApplicantCompany.case_data);
      });

      spyDel.mockImplementation(() => {return null;});

      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
