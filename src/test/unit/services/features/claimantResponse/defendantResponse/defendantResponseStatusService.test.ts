import {getStringStatus} from 'services/features/claimantResponse/defendantResponse/defendantResponseStatusService';
import {Claim} from 'models/claim';
import {DashboardDefendantItem} from 'models/dashboard/dashboardItem';
import {DefendantResponseStatus} from 'models/defendantResponseStatus';
import {t} from 'i18next';
import {PaymentOptionType} from "form/models/admission/paymentOption/paymentOptionType";
import {FullAdmission} from "models/fullAdmission";
import {PaymentIntention} from "form/models/admission/paymentIntention";

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Defendant status service', () =>{
  it('should return proper status for NO_RESPONSE', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.NO_RESPONSE;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.RESPONSE_TO_CLAIM'));
  });

  it('should return proper status for ELIGIBLE_FOR_CCJ', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.ELIGIBLE_FOR_CCJ;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_YOU_HAVE_NOT_RESPONDED'));
    expect(result).toContain(t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_ASK_FOR_CCJ'));
    expect(result).toContain(t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_STILL_CAN_RESPOND'));
  });

  it('should return proper status for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE, IMMEDIATELY', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.PAST_DEADLINE_IMMEDIATELY'));
  });

  it('should return proper status for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE, BY_SET_DATE', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.PAST_DEADLINE_BY_SPECIFIED_DATE'));
  });

  it('should return proper status for ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE, INSTALMENTS', () => {
    const claim = new Claim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.PAST_DEADLINE_INSTALMENTS'));
  });

  it('should return proper status for MORE_TIME_REQUESTED', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.MORE_TIME_REQUESTED;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.MORE_TIME_REQUESTED'));
  });

  it('should return proper status for PAID_IN_FULL', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.PAID_IN_FULL;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.CLAIM_SETTLED'));
  });

  it('should return proper status for CLAIMANT_ACCEPTED_STATES_PAID', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.PAID_IN_FULL;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.CLAIM_SETTLED'));
  });

  it('should return proper status for PAID_IN_FULL_CCJ_CANCELLED', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.PAID_IN_FULL_CCJ_CANCELLED;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.CONFIRMED_PAID'));
  });

  it('should return proper status for PAID_IN_FULL_CCJ_SATISFIED', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.PAID_IN_FULL_CCJ_SATISFIED;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.CONFIRMED_PAID'));
  });

  it('should return proper status for TRANSFERRED', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.TRANSFERRED;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.CASE_SENT_TO_COURT'));
  });

  it('should return proper status for REDETERMINATION_BY_JUDGE', () => {
    const claim = new Claim();
    const item = new DashboardDefendantItem();
    item.defendantResponseStatus = DefendantResponseStatus.REDETERMINATION_BY_JUDGE;

    const result = getStringStatus(item, claim, 'eng');

    expect(result).toContain(t('PAGES.DASHBOARD.REDETERMINATION_BY_JUDGE'));
  });
});
