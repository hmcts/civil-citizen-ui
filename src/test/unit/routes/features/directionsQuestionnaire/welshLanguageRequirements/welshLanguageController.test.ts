import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  RESPONSE_TASK_LIST_URL,
  DQ_WELSH_LANGUAGE_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import noRespondentTelephoneClaimantIntentionMock
  from '../../../../../utils/mocks/noRespondentTelephoneClaimantIntentionMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Welsh Language Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return welsh language page when has data in redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_WELSH_LANGUAGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.WELSH_LANGUAGE.PAGE_TITLE'));
      });
    });

    it('should return welsh language page- when redis is empty', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), undefined);
      });
      await request(app).get(DQ_WELSH_LANGUAGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.WELSH_LANGUAGE.PAGE_TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_WELSH_LANGUAGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should return welsh language page on empty post', async () => {
      await request(app).post(DQ_WELSH_LANGUAGE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.SELECT_LANGUAGE_SPEAK'));
        expect(res.text).toContain(t('ERRORS.SELECT_LANGUAGE_DOCUMENTS'));
      });
    });

    it('should redirect to Task List page', async () => {
      await request(app).post(DQ_WELSH_LANGUAGE_URL)
        .send({speakLanguage: 'en', documentsLanguage: 'en-cy'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to Claimant Response Task List page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
      await request(app).post(DQ_WELSH_LANGUAGE_URL)
        .send({speakLanguage: 'en', documentsLanguage: 'en-cy'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_WELSH_LANGUAGE_URL)
        .send({speakLanguage: 'en', documentsLanguage: 'en-cy'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
