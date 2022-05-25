import TimelineRow from '../../../../../../main/common/form/models/timeLineOfEvents/timelineRow';
import {Validator} from 'class-validator';
import {
  DATE_REQUIRED,
  DESCRIPTION_REQUIRED,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

describe('TimeLineRow', () => {
  describe('atLeastOneRowPopulated', () => {
    it('should return true when one field is populated', () => {
      //Given
      const timelineRow = new TimelineRow('21 of April 2022');
      //When
      const isPopulated = timelineRow.isAtLeastOneFieldPopulated();
      //Then
      expect(isPopulated).toBeTruthy();
    });
    it('should return false when no fields are populated', () => {
      //Given
      const timelineRow = new TimelineRow();
      //When
      const isPopulated = timelineRow.isAtLeastOneFieldPopulated();
      //Then
      expect(isPopulated).toBeFalsy();
    });
  });
  describe('validation', () => {
    const validator = new Validator();
    it('should return error when date is populated but not description', () => {
      //Given
      const timelineRow = new TimelineRow('21 of April 2022');
      //When
      const errors = validator.validateSync(timelineRow);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints?.isDefined).toBe(DESCRIPTION_REQUIRED);
    });
    it('should return error when description is populated but not date', () => {
      //Given
      const timelineRow = new TimelineRow('', 'description');
      //When
      const errors = validator.validateSync(timelineRow);
      //Then
      expect(errors.length).toBe(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(DATE_REQUIRED);
    });
    it('should not have errors when empty form', () => {
      //Given
      const timelineRow = new TimelineRow();
      //When
      const errors = validator.validateSync(timelineRow);
      //Then
      expect(errors.length).toBe(0);
    });
  });
});
