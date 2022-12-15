import {BreathingSpace} from 'common/models/breathingSpace';
import {DebtRespiteLiftDate} from 'common/models/breathingSpace/debtRespiteLiftDate';
import {ccdBreathingSpace} from 'common/models/ccd/ccdBreathingSpace/ccdBreathingSpace';
import {convertBreathingSpaceToCCD} from 'services/translation/breathingSpace/convertBreathingSpaceToCCD';

const breathingSpace: BreathingSpace = {
  debtRespiteLiftDate: new DebtRespiteLiftDate('29', '09', '2020'),
};

const expectedLift: ccdBreathingSpace = {
  expectedEnd: '2020-09-29',
};

describe('translate lift to ccd model', () => {
  it('should translate to Lift to ccd', () => {
    const liftCCD = convertBreathingSpaceToCCD(breathingSpace);
    expect(liftCCD).toMatchObject(expectedLift);
  });
});
