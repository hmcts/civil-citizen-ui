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

  it('should be invalid with missing date', () => {
    const row = new TimelineRow(undefined, undefined, undefined, 'description');
    const form = new GenericForm(row);
    form.validateSync();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.getErrors()[0].property).toBe('date');
  });
});
