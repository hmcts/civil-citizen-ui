import {t} from 'i18next';

export enum HearingDuration {
  MINUTES_30 = 'MINUTES_30',
  MINUTES_60 = 'MINUTES_60',
  MINUTES_90 = 'MINUTES_90',
  MINUTES_120 = 'MINUTES_120',
  MINUTES_150 = 'MINUTES_150',
  MINUTES_180 = 'MINUTES_180',
  MINUTES_240 = 'MINUTES_240',
  DAY_1 = 'DAY_1',
  DAY_2 = 'DAY_2',
}

export function formatHearingDuration (hearingDuration: HearingDuration)
{
  return t('COMMON.HEARING_DURATION.'+hearingDuration.toString());
}
