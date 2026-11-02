import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

const getTimelineDateError = (row: TimelineRow): string => {
  if (!row.day && !row.month && !row.year) {
    return row.isAtLeastOneFieldPopulated() ? 'ERRORS.DATE_REQUIRED' : undefined;
  }
  if (!row.month || !row.year) {
    return 'ERRORS.DATE_REQUIRED';
  }
  const day = row.day ? Number(row.day) : undefined;
  const month = Number(row.month);
  const year = Number(row.year);
  if (!isPositiveInteger(month) || month > 12 || !isPositiveInteger(year) || (day !== undefined && !isPositiveInteger(day))) {
    return 'ERRORS.VALID_DATE';
  }
  const date = new Date(year, month - 1, day ?? 1);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== (day ?? 1)) {
    return 'ERRORS.VALID_DATE';
  }
  return date > new Date() ? 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE' : undefined;
};

@ValidatorConstraint({name: 'TimelineDateValidator', async: false})
export class TimelineDateValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    return getTimelineDateError(args.object as TimelineRow) === undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return getTimelineDateError(args.object as TimelineRow);
  }
}
