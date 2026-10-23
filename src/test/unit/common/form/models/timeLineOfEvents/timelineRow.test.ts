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
    const row = new TimelineRow(date.getDay(), date.getMonth(), date.getFullYear() + 1, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });
});
