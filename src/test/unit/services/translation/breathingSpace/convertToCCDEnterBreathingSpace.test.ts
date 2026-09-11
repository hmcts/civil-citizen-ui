import {Claim} from 'models/claim';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {
  translateDraftBreathingSpaceEnterToCCD,
} from 'services/translation/breathingSpace/convertToCCDEnterBreathingSpace';

describe('convertToCCDEnterBreathingSpace', () => {
  it('should map standard draft including expected end', () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'REF123',
      new Date(2024, 0, 15),
      new Date(2024, 2, 15),
    );

    expect(translateDraftBreathingSpaceEnterToCCD(claim)).toEqual({
      enterBreathing: {
        type: BreathingSpaceType.STANDARD,
        reference: 'REF123',
        start: '2024-01-15',
        expectedEnd: '2024-03-15',
      },
    });
  });

  it('should map mental health draft with null expected end and omit blank reference', () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.MENTAL_HEALTH,
      '   ',
      new Date(2024, 5, 1),
      null,
    );

    expect(translateDraftBreathingSpaceEnterToCCD(claim)).toEqual({
      enterBreathing: {
        type: BreathingSpaceType.MENTAL_HEALTH,
        start: '2024-06-01',
        expectedEnd: null,
      },
    });
  });
});
