import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

@ValidatorConstraint({name: 'TimelineDateValidator', async: false})
export class TimelineDateValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const row = args.object as TimelineRow;
    if (!row.day && !row.month && !row.year) {
      return true;
    }

    const day = row.day ? Number(row.day) : undefined;
    const month = row.month ? Number(row.month) : undefined;
    const year = row.year ? Number(row.year) : undefined;

    if (!month || !year) {
      return false;
    }

    if (day) {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return false;
      }
      if (date > new Date()) {
        return false;
      }
    } else {
      if (month < 1 || month > 12) {
        return false;
      }
      const date = new Date(year, month - 1, 1);
      if (date > new Date()) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const row = args.object as TimelineRow;
    if (!row.month || !row.year) {
      return 'ERRORS.DATE_REQUIRED';
    }
    const day = row.day ? Number(row.day) : undefined;
    const month = row.month ? Number(row.month) : undefined;
    const year = row.year ? Number(row.year) : undefined;
    if (day) {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return 'ERRORS.VALID_DATE';
      }
    } else if (month < 1 || month > 12) {
      return 'ERRORS.VALID_DATE';
    }
    return 'ERRORS.CORRECT_DATE_NOT_IN_FUTURE';
  }
}
