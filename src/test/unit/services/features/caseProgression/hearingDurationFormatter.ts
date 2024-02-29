import {HearingDurationFormatter} from 'services/features/caseProgression/hearingDurationFormatter';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {t} from 'i18next';

describe('Hearing Duration formatter', () => {
  it('should format Hearing Duration correctly', async () => {
    //Given
    const hearingDurationExpected = t('COMMONS.HEARING_DURATION.MINUTES_60');
    //When
    const hearingDurationActual = HearingDurationFormatter.formatHearingDuration(HearingDuration.MINUTES_60, 'en');
    //Then
    expect(hearingDurationExpected).toEqual(hearingDurationActual);
  });
});

