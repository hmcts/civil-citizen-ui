import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {ORDER_JUDGE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { buildPageContent } from 'routes/features/generalApplication/orderJudgeController';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(ORDER_JUDGE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(ORDER_JUDGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on empty textarea', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .send({text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_ORDER_JUDGE'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('buildPageContent', () => {
    it('should build content for SET_ASIDE_JUDGEMENT', async () => {
      const result = buildPageContent(ApplicationTypeOption.SET_ASIDE_JUDGEMENT);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SET_ASIDE_JUDGEMENT'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SET_ASIDE_JUDGEMENT_HINT_TEXT'));
    });
    it('should build content for SET_ASIDE_JUDGEMENT', async () => {
      const result = buildPageContent(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_THAT'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUGGEST_NEW_PLAN'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for VARY_ORDER', async () => {
      const result = buildPageContent(ApplicationTypeOption.VARY_ORDER);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for ADJOURN_HEARING', async () => {
      const result = buildPageContent(ApplicationTypeOption.ADJOURN_HEARING);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.A_JUDGE_WILL_CONSIDER_ADJOURN_HEARING'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_WILL_NEED_ADD_INFO'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADJOURN_HEARING_HINT_TEXT'));
    });
    it('should build content for EXTEND_TIME', async () => {
      const result = buildPageContent(ApplicationTypeOption.EXTEND_TIME);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_MORE_TIME'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_MORE_TIME'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MORE_TIME_HINT_TEXT'));
    });
    it('should build content for RELIEF_FROM_SANCTIONS', async () => {
      const result = buildPageContent(ApplicationTypeOption.RELIEF_FROM_SANCTIONS);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PENALTY'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for AMEND_A_STMT_OF_CASE', async () => {
      const result = buildPageContent(ApplicationTypeOption.AMEND_A_STMT_OF_CASE);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_CHANGE_CLAIM'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.UPLOAD_NEW_VERSION'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[5].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CHANGE_CLAIM_HINT_TEXT'));
    });
    it('should build content for SUMMARY_JUDGMENT', async () => {
      const result = buildPageContent(ApplicationTypeOption.SUMMARY_JUDGMENT);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SUMMARY_JUDGMENT'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUMMARY_JUDGMENT_HINT_TEXT'));
    });
    it('should build content for STRIKE_OUT', async () => {
      const result = buildPageContent(ApplicationTypeOption.STRIKE_OUT);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT_DISMISSED'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MENTION_DATE'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for STAY_THE_CLAIM', async () => {
      const result = buildPageContent(ApplicationTypeOption.STAY_THE_CLAIM);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_STAY_THE_CLAIM'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_STAY_THE_CLAIM'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX'));
      expect(result.hintText).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.STAY_THE_CLAIM_HINT_TEXT'));
    });
    it('should build content for UNLESS_ORDER', async () => {
      const result = buildPageContent(ApplicationTypeOption.UNLESS_ORDER);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_ACTION_UNLESS_ORDER'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_UNLESS_ORDER'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS'));
      expect(result.contentList[4].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for SETTLE_BY_CONSENT', async () => {
      const result = buildPageContent(ApplicationTypeOption.SETTLE_BY_CONSENT);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_SETTLED'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.INCLUDE_NAME'));
      expect(result.contentList[2].data.html).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_TERMS'));
      expect(result.contentList[3].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
    it('should build content for PROCEEDS_IN_HERITAGE', async () => {
      const result = buildPageContent(ApplicationTypeOption.PROCEEDS_IN_HERITAGE);
      expect(result.contentList[0].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER'));
      expect(result.contentList[1].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PROCEEDS_IN_HERITAGE'));
      expect(result.contentList[2].data.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION'));
      expect(result.hintText).toContain('');
    });
  });
  
});
