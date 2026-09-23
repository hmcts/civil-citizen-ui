import {
  toCUIBreathingSpaceEnterInfo,
  toCUIBreathingSpaceLiftInfo,
} from 'services/translation/convertToCUI/convertToCUIBreathingSpace';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {BreathingSpaceEnterInfo} from 'models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceLiftInfo} from 'models/breathingSpace/breathingSpaceLiftInfo';

describe('convertToCUIBreathingSpace', () => {
  it('should return undefined when enterBreathing is missing', () => {
    expect(toCUIBreathingSpaceEnterInfo(undefined)).toBeUndefined();
  });

  it('should map enterBreathing CCD fields to CUI dates and type', () => {
    const result = toCUIBreathingSpaceEnterInfo({
      type: BreathingSpaceType.STANDARD,
      reference: 'REF123',
      start: '2024-01-15',
      expectedEnd: null,
    });

    expect(result?.type).toBe(BreathingSpaceType.STANDARD);
    expect(result?.reference).toBe('REF123');
    expect(result?.start).toEqual(new Date('2024-01-15'));
    expect(result?.expectedEnd).toBeNull();
  });

  it('should return undefined when liftBreathing has no expectedEnd', () => {
    expect(toCUIBreathingSpaceLiftInfo({})).toBeUndefined();
  });

  it('should map liftBreathing CCD fields to CUI', () => {
    const result = toCUIBreathingSpaceLiftInfo({
      expectedEnd: '2024-03-15',
    });

    expect(result?.expectedEnd).toEqual(new Date('2024-03-15'));
  });

  it('should hydrate enterBreathing and liftBreathing on Claim via translateCCDCaseDataToCUIModel', () => {
    const ccdClaim = {
      enterBreathing: {
        type: BreathingSpaceType.MENTAL_HEALTH,
        start: '2024-06-01',
        expectedEnd: null,
      },
    } as CCDClaim;

    const claim = translateCCDCaseDataToCUIModel(ccdClaim);

    expect(claim.enterBreathing?.type).toBe(BreathingSpaceType.MENTAL_HEALTH);
    expect(claim.enterBreathing?.start).toEqual(new Date('2024-06-01'));
    expect(claim.liftBreathing).toBeUndefined();
    expect(claim.hasBreathingSpace()).toBe(true);
    expect(claim.isMentalHealthBreathingSpace()).toBe(true);
    expect(claim.isStandardBreathingSpace()).toBe(false);
  });
});

describe('Claim breathing space helpers', () => {
  it('should treat enter without lift as in breathing space', () => {
    const claim = new Claim();
    claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);

    expect(claim.hasBreathingSpace()).toBe(true);
    expect(claim.isStandardBreathingSpace()).toBe(true);
  });

  it('should not treat lifted breathing space as active', () => {
    const claim = new Claim();
    claim.enterBreathing = new BreathingSpaceEnterInfo(BreathingSpaceType.STANDARD);
    claim.liftBreathing = new BreathingSpaceLiftInfo(new Date('2024-03-15'));

    expect(claim.hasBreathingSpace()).toBe(false);
    expect(claim.isStandardBreathingSpace()).toBe(false);
  });
});
