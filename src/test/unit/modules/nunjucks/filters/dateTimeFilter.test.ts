import {dateTimeFilter} from 'modules/nunjucks/filters/dateTimeFilter';

describe('dateTimeFilter', () => {
  it('should not apply an hour offset for a date in winter (GMT)', () => {
    const winterDate = new Date('2023-11-20T10:30:05.123Z');
    const expected = '20 November 2023, 10:30:05 am';
    const result = dateTimeFilter(winterDate);
    expect(result).toBe(expected);
  });

  it('should apply a one-hour offset for a date in summer (BST)', () => {
    const summerDate = new Date('2023-07-20T10:30:05.123Z');
    const expected = '20 July 2023, 11:30:05 am';
    const result = dateTimeFilter(summerDate);
    expect(result).toBe(expected);
  });
});
