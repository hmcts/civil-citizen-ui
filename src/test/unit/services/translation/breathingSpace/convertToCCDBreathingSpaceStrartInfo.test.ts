import {BreathingSpace} from 'common/models/breathingSpace';
import {DebtRespiteStartDate} from 'common/models/breathingSpace/debtRespiteStartDate';
import {toCCDBreathingSpaceStartInfo} from "services/translation/breathingSpace/convertToCCDBreathingSpaceStrartInfo";
import {CCDBreathingSpaceStartInfo} from "models/ccd/ccdBreathingSpace/ccdBreathingSpaceStartInfo";
import {DebtRespiteOptionType} from "models/breathingSpace/debtRespiteOptionType";
import {DebtRespiteEndDate} from "models/breathingSpace/debtRespiteEndDate";

const breathingSpace: BreathingSpace = {
  debtRespiteOption: {
    type: DebtRespiteOptionType.STANDARD,
  },
  debtRespiteReferenceNumber: {
    referenceNumber: '0000',
  },
  debtRespiteStartDate: new DebtRespiteStartDate('29', '09', '2020'),
  debtRespiteEndDate: new DebtRespiteEndDate('30', '09', '2020'),
};

const expectedStart: CCDBreathingSpaceStartInfo = {
  type: 'STANDARD',
  reference: '0000',
  start: new Date('2020-09-29'),
  expectedEnd: new Date('2020-09-30')
};

describe('translate start to ccd model', () => {
  it('should translate to Start to ccd', () => {
    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedStart);
  });
});
