import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_UPLOAD_DOCUMENTS_CANCEL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = MEDIATION_UPLOAD_DOCUMENTS_CANCEL;

describe('Mediation Cancel Document Upload Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockGenerateRedisKey.mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 1000;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should render page successfully', async () => {
      await request(app)
        .get(CONTROLLER_URL.replace(':id', '1111'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE'));
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant dashboard when YES is selected and user is claimant', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = 1000;
        jest.spyOn(claim, 'isClaimant').mockReturnValue(true);
        return claim;
      });

      await request(app)
        .post(CONTROLLER_URL.replace(':id', '1111'))
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL.replace(':id', '1111'));
        });
    });

    it('should redirect to defendant summary when YES is selected and user is defendant', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = 1000;
        jest.spyOn(claim, 'isClaimant').mockReturnValue(false);
        return claim;
      });

      await request(app)
        .post(CONTROLLER_URL.replace(':id', '1111'))
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', '1111'));
        });
    });

    it('should redirect to previous page when NO is selected', async () => {
      await request(app)
        .post(CONTROLLER_URL.replace(':id', '1111'))
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          // Default fallback in controller if session.previousUrl is missing
          expect(res.header.location).toContain('/mediation/upload-documents');
        });
    });

    it('should show error when no option is selected', async () => {
      await request(app)
        .post(CONTROLLER_URL.replace(':id', '1111'))
        .send({option: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_OPTION_NAC_YDW'));
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
