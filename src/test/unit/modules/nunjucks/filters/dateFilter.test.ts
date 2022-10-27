import {addDaysFilterTranslated} from '../../../../../main/modules/nunjucks/filters/dateFilter';
import {t} from 'i18next';
import {DateTime} from 'luxon';

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
});
