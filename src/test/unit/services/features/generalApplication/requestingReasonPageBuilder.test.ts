import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {buildRequestingReasonPageContent} from 'services/features/generalApplication/requestingReasonPageBuilder';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('General Application - Requesting reason page builder', () => {
  const lng = 'en';

  it('should build content for SET_ASIDE_JUDGEMENT', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.SET_ASIDE_JUDGEMENT, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.SHOULD');
    expect(result[1].data.html).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.EXPLAIN');
    expect(result[1].data.html).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.IF_DONT_BELIEVE');
    expect(result[2].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CANCEL_JUDGMENT.YOU_WILL_HAVE_OPTION');
  });
  it('should build content for VARY_PAYMENT_TERMS_OF_JUDGMENT', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.VARY_JUDGMENT');
  });
  it('should build content for VARY_ORDER', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.VARY_ORDER, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RECONSIDER');
  });
  it('should build content for ADJOURN_HEARING', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.ADJOURN_HEARING, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CHANGE_HEARING');
  });
  it('should build content for EXTEND_TIME', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.EXTEND_TIME, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.MORE_TIME');
  });
  it('should build content for RELIEF_FROM_SANCTIONS', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.RELIEF_FROM_SANCTIONS, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.SHOULD');
    expect(result[1].data.html).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.WHY_BEEN_UNABLE');
    expect(result[1].data.html).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.THE_EFFECT');
    expect(result[1].data.html).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.ANY_RELEVANT_INFORMATION');
    expect(result[2].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.RELIEF_PENALTY.YOU_WILL_HAVE_OPTION');
  });
  it('should build content for AMEND_A_STMT_OF_CASE', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.AMEND_A_STMT_OF_CASE, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.CHANGE_CLAIM');
  });
  it('should build content for SUMMARY_JUDGMENT', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.SUMMARY_JUDGEMENT, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.SUMMARY_JUDGMENT');
  });
  it('should build content for STRIKE_OUT', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.STRIKE_OUT, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.STRIKE_OUT');
  });
  it('should build content for STAY_THE_CLAIM', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.STAY_THE_CLAIM, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.PAUSE');
  });
  it('should build content for UNLESS_ORDER', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.UNLESS_ORDER, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.IMPOSE_SANCTION');
  });
  it('should build content for SETTLE_BY_CONSENT', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.SETTLE_BY_CONSENT, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.NOT_ON_LIST');
  });
  it('should build content for PROCEEDS_IN_HERITAGE', async () => {
    const result = buildRequestingReasonPageContent(ApplicationTypeOption.OTHER, lng);
    expect(result[0].data.text).toContain('PAGES.GENERAL_APPLICATION.APPLICATION_REASON.NOT_ON_LIST');
  });
});
