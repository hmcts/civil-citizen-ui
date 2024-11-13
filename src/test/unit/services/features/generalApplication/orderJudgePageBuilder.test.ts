import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {buildPageContent} from 'services/features/generalApplication/orderJudgePageBuilder';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('General Application - Application type', () => {
  const lng = 'en';

  it('should build content for SET_ASIDE_JUDGEMENT', async () => {
    const result = buildPageContent(ApplicationTypeOption.SET_ASIDE_JUDGEMENT, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SET_ASIDE_JUDGEMENT');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SET_ASIDE_JUDGEMENT_HINT_TEXT');
  });
  it('should build content for SET_ASIDE_JUDGEMENT', async () => {
    const result = buildPageContent(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_THAT');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUGGEST_NEW_PLAN');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for VARY_ORDER', async () => {
    const result = buildPageContent(ApplicationTypeOption.VARY_ORDER, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for ADJOURN_HEARING', async () => {
    const result = buildPageContent(ApplicationTypeOption.ADJOURN_HEARING, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_ADJOURN_HEARING');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_WILL_NEED_ADD_INFO');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADJOURN_HEARING_HINT_TEXT');
  });
  it('should build content for EXTEND_TIME', async () => {
    const result = buildPageContent(ApplicationTypeOption.EXTEND_TIME, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_MORE_TIME');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_MORE_TIME');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MORE_TIME_HINT_TEXT');
  });
  it('should build content for RELIEF_FROM_SANCTIONS', async () => {
    const result = buildPageContent(ApplicationTypeOption.RELIEF_FROM_SANCTIONS, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PENALTY');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for AMEND_A_STMT_OF_CASE', async () => {
    const result = buildPageContent(ApplicationTypeOption.AMEND_A_STMT_OF_CASE, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_CHANGE_CLAIM');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.UPLOAD_NEW_VERSION');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[5].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CHANGE_CLAIM_HINT_TEXT');
  });
  it('should build content for SUMMARY_JUDGMENT', async () => {
    const result = buildPageContent(ApplicationTypeOption.SUMMARY_JUDGEMENT, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_SUMMARY_JUDGMENT');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_OR_ALTER');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SUMMARY_JUDGMENT_HINT_TEXT');
  });
  it('should build content for STRIKE_OUT', async () => {
    const result = buildPageContent(ApplicationTypeOption.STRIKE_OUT, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_DOCUMENT_DISMISSED');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.MENTION_DATE');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for STAY_THE_CLAIM', async () => {
    const result = buildPageContent(ApplicationTypeOption.STAY_THE_CLAIM, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER_STAY_THE_CLAIM');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.ADD_INFO_STAY_THE_CLAIM');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_CAN_ALSO_ALTER');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.CONTENT_BOX');
    expect(result.hintText).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.STAY_THE_CLAIM_HINT_TEXT');
  });
  it('should build content for UNLESS_ORDER', async () => {
    const result = buildPageContent(ApplicationTypeOption.UNLESS_ORDER, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_ACTION_UNLESS_ORDER');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_UNLESS_ORDER');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_REASONS');
    expect(result.contentList[4].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for SETTLE_BY_CONSENT', async () => {
    const result = buildPageContent(ApplicationTypeOption.SETTLE_BY_CONSENT, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.YOU_SHOULD');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_SETTLED');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.INCLUDE_NAME');
    expect(result.contentList[2].data.html).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.EXPLAIN_TERMS');
    expect(result.contentList[3].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
  it('should build content for Other', async () => {
    const result = buildPageContent(ApplicationTypeOption.OTHER, lng);
    expect(result.contentList[0].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.JUDGE_WILL_CONSIDER');
    expect(result.contentList[1].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.SHOULD_EXPLAIN_PROCEEDS_IN_HERITAGE');
    expect(result.contentList[2].data.text).toContain('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.THE_INFORMATION');
    expect(result.hintText).toContain('');
  });
});
