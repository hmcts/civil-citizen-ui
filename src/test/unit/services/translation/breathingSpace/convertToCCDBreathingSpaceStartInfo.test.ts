import {BreathingSpace} from 'common/models/breathingSpace';
import {DebtRespiteStartDate} from 'common/models/breathingSpace/debtRespiteStartDate';
import {
  toCCDBreathingSpaceLiftInfo,
  toCCDBreathingSpaceStartInfo,
} from 'services/translation/breathingSpace/convertToCCDBreathingSpaceStartInfo';
import {CCDBreathingSpaceStartInfo} from 'models/ccd/ccdBreathingSpace/ccdBreathingSpaceStartInfo';
import {DebtRespiteOptionType} from 'models/breathingSpace/debtRespiteOptionType';
import {DebtRespiteEndDate} from 'models/breathingSpace/debtRespiteEndDate';

describe('translate start to ccd model', () => {
  it('should translate to undefined to ccd', () => {
    const breathingSpace: BreathingSpace = undefined;

    const expectedResult: CCDBreathingSpaceStartInfo = {
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate field put undefined to ccd', () => {
    const breathingSpace: BreathingSpace = {
      debtRespiteOption: undefined,
      debtRespiteReferenceNumber: undefined,
      debtRespiteStartDate: undefined,
      debtRespiteEndDate: undefined,
    };

    const expectedResult: CCDBreathingSpaceStartInfo = {
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate to Reference Number to ccd', () => {

    const breathingSpace: BreathingSpace = {
      debtRespiteReferenceNumber: {
        referenceNumber: '0000',
      },
    };

    const expectedResult: CCDBreathingSpaceStartInfo = {
      reference: '0000',
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate to Type to ccd', () => {

    const breathingSpace: BreathingSpace = {
      debtRespiteOption: {
        type: DebtRespiteOptionType.STANDARD,
      },
    };

    const expectedResult: CCDBreathingSpaceStartInfo = {
      type: 'STANDARD',
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate to start to ccd', () => {

    const breathingSpace: BreathingSpace = {
      debtRespiteStartDate: new DebtRespiteStartDate('29', '09', '2020'),
    };

    const expectedResult: CCDBreathingSpaceStartInfo = {
      start: new Date('2020-09-29'),
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate to expected end to ccd', () => {

    const breathingSpace: BreathingSpace = {
      debtRespiteEndDate: new DebtRespiteEndDate('30', '09', '2020'),
    };

    const expectedResult: CCDBreathingSpaceStartInfo = {
      expectedEnd: new Date('2020-09-30'),
    };

    const startCCD = toCCDBreathingSpaceStartInfo(breathingSpace);
    expect(startCCD).toMatchObject(expectedResult);
  });

  it('should translate breathing space lift date to ccd', () => {

    //given
    const breathingSpace: BreathingSpace = {
      debtRespiteLiftDate: new DebtRespiteEndDate('05', '10', '2023'),
    };
    const expectedResult: CCDBreathingSpaceStartInfo = {
      expectedEnd: new Date('2023-10-05'),
    };

    //when
    const startCCD = toCCDBreathingSpaceLiftInfo(breathingSpace);

    //then
    expect(startCCD).toMatchObject(expectedResult);
  });
});
