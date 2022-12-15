import {BreathingSpace} from 'common/models/breathingSpace';
import {DebtRespiteLiftDate} from 'common/models/breathingSpace/debtRespiteLiftDate';
import {CCDLift} from 'common/models/ccd/ccdBreathingSpace/ccdLift';
import {convertLiftToCCD} from 'services/translation/breathingSpace/convertToCCDLift';

const breathingSpace: BreathingSpace = {
  debtRespiteLiftDate: new DebtRespiteLiftDate('29', '09', '2020'),
};

const expectedLift: CCDLift = {
  event: undefined,
  eventDescription: undefined,
  expectedEnd: '2020-09-29',
};

describe('translate lift to ccd model', () => {
  it('should translate to Lift to ccd', () => {
    const liftCCD = convertLiftToCCD(breathingSpace);
    expect(liftCCD).toMatchObject(expectedLift);
  });
});
