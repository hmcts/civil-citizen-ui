import {addDaysFilterTranslated} from '../../../../../main/modules/nunjucks/filters/dateFilter';
import {t} from 'i18next';
import {DateTime} from 'luxon';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Add the days to current date to get the expected result', () => {
  it('should add the day(s) successfully to the current date', () => {
    //Given
    const days = -1;
    const expectedResult = DateTime.now().day + days;

    //When
    const result = addDaysFilterTranslated('now',  days, t);

    //Then
    expect(result).not.toBeNull();
    expect(result).toContain(expectedResult.toString());
  });

  it('should add the day(s) successfully to the provided date', () => {
    //Given
    const referenceDate = new Date('2004-11-28T17:33:46.763Z');
    const days = 5;
    //When
    const result = addDaysFilterTranslated(referenceDate.toJSON(), days, t);
    //Then
    expect(result).not.toBeNull();
    expect(result).toContain('3 COMMON.MONTH_NAMES.DECEMBER 2004');
  });
});
