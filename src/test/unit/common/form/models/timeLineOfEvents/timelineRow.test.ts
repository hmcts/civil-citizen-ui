import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {GenericForm} from 'form/models/genericForm';

describe('TimelineRow', () => {
  it('should be valid with full date', () => {
    const row = new TimelineRow(1, 1, 2020, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should be valid with missing day', () => {
    const row = new TimelineRow(undefined, 1, 2020, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should be invalid with invalid whole date', () => {
    const row = new TimelineRow(31, 2, 2020, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with future date', () => {
    const row = new TimelineRow(1, 1, 2099, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with all missing date values', () => {
    const row = new TimelineRow(undefined, undefined, undefined, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with missing month value', () => {
    const row = new TimelineRow(undefined, undefined, 2000, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with incorrect month value', () => {
    const row = new TimelineRow(undefined, 0, 2000, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with incorrect year value', () => {
    const row = new TimelineRow(undefined, 6, -1, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });

  it('should be invalid with future date value', () => {
    const date = new Date();
    const row = new TimelineRow(date.getDate(), date.getMonth() + 1, date.getFullYear() + 1, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.getErrors()[0].constraints).toEqual({TimelineDateValidator: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'});
  });

  it('should be valid with current month and missing day', () => {
    const date = new Date();
    const row = new TimelineRow(undefined, date.getMonth() + 1, date.getFullYear(), 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should be invalid with future month and missing day', () => {
    const date = new Date();
    const row = new TimelineRow(undefined, date.getMonth() + 1, date.getFullYear() + 1, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.getErrors()[0].constraints).toEqual({TimelineDateValidator: 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE'});
  });

  it.each([
    [undefined, 1.5, 2020],
    [1.5, 3, 2020],
    [1, 13, 2020],
    [undefined, 3, 20],
  ])('should return valid date error for day %s, month %s and year %s', (day, month, year) => {
    const row = new TimelineRow(day, month, year, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.getErrors()[0].constraints).toEqual({TimelineDateValidator: 'ERRORS.VALID_DATE'});
  });

  it('should return date required error when month is missing', () => {
    const row = new TimelineRow(1, undefined, 2020, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.getErrors()[0].constraints).toEqual({TimelineDateValidator: 'ERRORS.DATE_REQUIRED'});
  });

  it('should be valid when the row is empty', () => {
    const row = new TimelineRow();
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeFalsy();
  });
});
