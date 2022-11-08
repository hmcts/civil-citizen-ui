import {
  translateAccountType,
  translatePriorityDebt,
  translateRepaymentSchedule,
  translateResidenceType,
} from '../../../main/services/genericService';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Generic Service', () => {
  describe('translateAccountType', () => {
    it('should return current account translation', () => {
      const translation = translateAccountType('CURRENT_ACCOUNT', 'cimode');
      expect(translation).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT');
    });

    it('should return savings account translation', () => {
      const translation = translateAccountType('SAVINGS_ACCOUNT', 'cimode');
      expect(translation).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.SAVINGS_ACCOUNT');
    });

    it('should return other account translation', () => {
      const translation = translateAccountType('OTHER', 'cimode');
      expect(translation).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.OTHER');
    });

    it('should return ISA translation', () => {
      const translation = translateAccountType('ISA', 'cimode');
      expect(translation).toBe('PAGES.CITIZEN_BANK_ACCOUNTS.ISA');
    });

    it('should return empty string if invalid account type is provided', () => {
      const translation = translateAccountType('foo', 'cimode');
      expect(translation).toBe('');
    });

    it('should return empty string if invalid account type is provided', () => {
      const translation = translateAccountType(undefined, 'cimode');
      expect(translation).toBe('');
    });
  });

  describe('translateResidenceType', () => {
    it('should return council translation', () => {
      const translation = translateResidenceType('COUNCIL_OR_HOUSING_ASSN_HOME', 'cimode');
      expect(translation).toBe('PAGES.RESIDENCE.ASSOCIATION_HOME');
    });

    it('should return joint owed home translation', () => {
      const translation = translateResidenceType('JOINT_OWN_HOME', 'cimode');
      expect(translation).toBe('PAGES.RESIDENCE.JOIN_HOME');
    });

    it('should return own home translation', () => {
      const translation = translateResidenceType('OWN_HOME', 'cimode');
      expect(translation).toBe('PAGES.RESIDENCE.OWN_HOME');
    });

    it('should return private rental translation', () => {
      const translation = translateResidenceType('PRIVATE_RENTAL', 'cimode');
      expect(translation).toBe('PAGES.RESIDENCE.RENTAL_HOME');
    });

    it('should return default translation', () => {
      const translation = translateResidenceType('Flat', 'cimode');
      expect(translation).toBe('Flat');
    });

    it('should return default translation', () => {
      const translation = translateResidenceType(undefined, 'cimode');
      expect(translation).toBe('');
    });
  });

  describe('translatePriorityDebt', () => {
    it('should return council tax translation', () => {
      const translation = translatePriorityDebt('councilTax', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.COUNCIL_TAX_AND_COMMUNITY_CHARGE');
    });

    it('should return electricity translation', () => {
      const translation = translatePriorityDebt('electricity', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.ELECTRICITY');
    });

    it('should return gas translation', () => {
      const translation = translatePriorityDebt('gas', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.GAS');
    });

    it('should return maintenance translation', () => {
      const translation = translatePriorityDebt('maintenance', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.MAINTENANCE');
    });

    it('should return mortgage translation', () => {
      const translation = translatePriorityDebt('mortgage', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.MORTGAGE');
    });

    it('should return rent translation', () => {
      const translation = translatePriorityDebt('rent', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.RENT');
    });

    it('should return water translation', () => {
      const translation = translatePriorityDebt('water', 'cimode');
      expect(translation).toBe('COMMON.CHECKBOX_FIELDS.WATER');
    });

    it('should return default translation', () => {
      const translation = translatePriorityDebt('Other debt', 'cimode');
      expect(translation).toBe('Other debt');
    });

    it('should return default translation', () => {
      const translation = translatePriorityDebt(undefined, 'cimode');
      expect(translation).toBe('');
    });
  });

  describe('translateRepaymentSchedule', () => {
    it('should return four weeks translation', () => {
      const translation = translateRepaymentSchedule('FOUR_WEEKS', 'cimode');
      expect(translation).toBe('COMMON.PAYMENT_SCHEDULE.FOUR_WEEKLY');
    });

    it('should return month translation', () => {
      const translation = translateRepaymentSchedule('MONTH', 'cimode');
      expect(translation).toBe('COMMON.PAYMENT_SCHEDULE.MONTHLY');
    });

    it('should return two weeks translation', () => {
      const translation = translateRepaymentSchedule('TWO_WEEKS', 'cimode');
      expect(translation).toBe('COMMON.PAYMENT_SCHEDULE.BI_WEEKLY');
    });

    it('should return weekly translation', () => {
      const translation = translateRepaymentSchedule('WEEK', 'cimode');
      expect(translation).toBe('COMMON.PAYMENT_SCHEDULE.WEEKLY');
    });

    it('should return default translation', () => {
      const translation = translateRepaymentSchedule('Other schedule', 'cimode');
      expect(translation).toBe('Other schedule');
    });

    it('should return default translation', () => {
      const translation = translateRepaymentSchedule(undefined, 'cimode');
      expect(translation).toBe('');
    });
  });
});
