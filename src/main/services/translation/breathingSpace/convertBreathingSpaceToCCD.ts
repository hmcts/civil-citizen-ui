import {DateTime} from 'luxon';
import {BreathingSpace} from '../../../common/models/breathingSpace';
import {ccdBreathingSpace} from '../../../common/models/ccd/ccdBreathingSpace/ccdBreathingSpace';

export const convertBreathingSpaceToCCD = (breathingSpace: BreathingSpace): ccdBreathingSpace => {
  return {
    expectedEnd: DateTime.fromJSDate(new Date(breathingSpace?.debtRespiteLiftDate?.date)).toFormat('yyyy-MM-dd'),
  };
};
