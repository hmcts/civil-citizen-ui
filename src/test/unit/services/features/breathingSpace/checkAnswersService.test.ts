import {getSummaryRows} from '../../../../../main/services/features/breathingSpace/checkAnswersService';
import {Claim} from '../../../../../main/common/models/claim';

jest.mock('i18next', () => ({
  t: (i: string) => i,
}));

describe('Lift Breathing Space Check Answers Service', () => {
  describe('getSummaryRows', () => {
    it('should return summary rows', () => {
      const claim = new Claim();
      claim.breathingSpace = {
        liftBreathing: {
          expectedEnd: '2023-05-20',
          eventDescription: 'Reason',
        },
      };
      const rows = getSummaryRows('123', claim, 'en');
      expect(rows.length).toBe(2);
      expect(rows[0].key.text).toBe('PAGES.BREATHING_SPACE.LIFT.WHEN_END');
      expect(rows[0].value.html).toContain('20 May 2023');
      expect(rows[1].key.text).toBe('PAGES.BREATHING_SPACE.LIFT.WHY_LIFTED');
      expect(rows[1].value.html).toBe('Reason');
    });
  });
});
