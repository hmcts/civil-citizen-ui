import {Claim} from '../../../../../main/common/models/claim';
import {translateDraftLiftBreathingSpaceToCCD} from '../../../../../main/services/translation/breathingSpace/convertToCCDLiftBreathingSpace';

describe('translateDraftLiftBreathingSpaceToCCD', () => {
  it('should map saved lift breathing space fields to CCD', () => {
    const claim = new Claim();
    claim.breathingSpace = {
      liftBreathing: {
        expectedEnd: '2026-08-06',
        eventDescription: 'Reason for lifting',
      },
    };

    expect(translateDraftLiftBreathingSpaceToCCD(claim)).toEqual({
      liftBreathing: {
        expectedEnd: '2026-08-06',
        eventDescription: 'Reason for lifting',
      },
    });
  });
});
