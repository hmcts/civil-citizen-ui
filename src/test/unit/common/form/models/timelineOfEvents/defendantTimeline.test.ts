import {DefendantTimeline} from '../../../../../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import TimelineRow from '../../../../../../main/common/form/models/timeLineOfEvents/timelineRow';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {DESCRIPTION_REQUIRED} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

describe('defendant timeline', () => {
  describe('validation', () => {
    it('should have errors nested when row field is not empty', async () => {
      //Given
      const defendant = new DefendantTimeline([new TimelineRow('12/01/2022')]);
      //When
      const form = new GenericForm(defendant);
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeTruthy();
      expect(form.errorFor('rows[0][description]')).toBe(DESCRIPTION_REQUIRED);
    });
    it('should not have errors when row fields are empty', async () => {
      //Given
      const defendant = new DefendantTimeline([new TimelineRow()]);
      //When
      const form = new GenericForm(defendant);
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
  });
  describe('buildEmptyForm', () => {
    it('should build empty form with for rows', () => {
      //When
      const form = DefendantTimeline.buildEmptyForm();
      //Then
      expect(form.rows.length).toBe(4);
      expect(form.comment).toBeUndefined();
    });
  });
  describe('buildPopulatedForm', () => {
    it('should add additional 3 rows when there is one row of timeline', () => {
      //Given
      const comment = 'some comment';
      const rows = [new TimelineRow('some date', 'description')];
      //When
      const form = DefendantTimeline.buildPopulatedForm(rows, comment);
      //Then
      expect(form.rows.length).toBe(4);
      expect(form.comment).toBe(comment);
      expect(form.rows[0].date).toBe(rows[0].date);
      expect(form.rows[0].description).toBe(rows[0].description);
    });
    it('should add 4 rows when no rows are empty', () => {
      //Given
      const comment = 'some comment';
      //When
      const form = DefendantTimeline.buildPopulatedForm([], comment);
      //Then
      expect(form.rows.length).toBe(4);
      expect(form.comment).toBe(comment);
    });
  });
  describe('filterEmptyRows ', () => {
    it('should filter empty rows when rows exist', () => {
      //Given
      const comment = 'some comment';
      const rows = [new TimelineRow('some date', 'description')];
      const form = DefendantTimeline.buildPopulatedForm(rows, comment);
      expect(form.rows.length).toBe(4);
      //When
      form.filterOutEmptyRows();
      //Then
      expect(form.rows.length).toBe(1);
    });
    it('should not filter when rows do not exist', () => {
      //Given
      const form = new DefendantTimeline();
      //When
      form.filterOutEmptyRows();
      //Then
      expect(form.rows).toBeUndefined();
    });
    it('should not filter when rows array is empty', () => {
      //Given
      const form = new DefendantTimeline([]);
      //When
      form.filterOutEmptyRows();
      //Then
      expect(form.rows.length).toBe(0);
    });
  });
});
