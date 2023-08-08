import {t} from 'i18next';
import {HearingDuration} from 'models/caseProgression/hearingDuration';

export class HearingDurationFormatter
{
  static formatHearingDuration(hearingDuration: HearingDuration): string
  {
    return t('COMMON.HEARING_DURATION.' + hearingDuration.toString());
  }
}
