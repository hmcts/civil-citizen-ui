import {DateTime} from 'luxon';
import {BreathingSpace} from '../../../common/models/breathingSpace';
import {CCDLift} from '../../../common/models/ccd/ccdBreathingSpace/ccdLift';

export const convertLiftToCCD = (breathingSpace: BreathingSpace): CCDLift => {
  return {
    event: undefined,
    eventDescription: undefined,
    expectedEnd: DateTime.fromJSDate(new Date(breathingSpace?.debtRespiteLiftDate?.date)).toFormat('yyyy-MM-dd'),
  };
};
