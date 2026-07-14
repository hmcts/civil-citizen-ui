import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {BreathingSpaceType} from '../../../models/breathingSpace/breathingSpace';

@ValidatorConstraint({name: 'exitDateValidator', async: false})
export class ExitDateValidator implements ValidatorConstraintInterface {

  private getValidationError(exitDate: Date, startDate: Date, bsType: BreathingSpaceType): string | undefined {
    if (exitDate <= startDate) {
      return 'ERRORS.BREATHING_SPACE_EXIT_DATE_AFTER_START';
    }
    if (bsType === BreathingSpaceType.STANDARD) {
      const maxDate = new Date(startDate);
      maxDate.setDate(maxDate.getDate() + 60);
      if (exitDate > maxDate) {
        return 'ERRORS.BREATHING_SPACE_EXIT_DATE_NOT_MORE_THAN_60_DAYS';
      }
    }
    return undefined;
  }

  validate(value: any, args: ValidationArguments) {
    const form = args.object as any;
    const startDate = form.breathingSpaceStartDate;
    const bsType = form.breathingSpaceType;
    const exitDate = value;

    if (!exitDate || !startDate) {
      return true;
    }

    return this.getValidationError(exitDate, startDate, bsType) === undefined;
  }

  defaultMessage(args: ValidationArguments) {
    const form = args.object as any;
    const startDate = form.breathingSpaceStartDate;
    const bsType = form.breathingSpaceType;
    const exitDate = args.value;

    if (!exitDate || !startDate) {
      return 'ERRORS.VALID_DATE';
    }

    return this.getValidationError(exitDate, startDate, bsType) || 'ERRORS.VALID_DATE';
  }
}
