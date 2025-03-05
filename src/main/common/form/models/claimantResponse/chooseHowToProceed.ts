import {IsDefined, Validate, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {ChooseHowProceed} from 'models/chooseHowProceed';

// temporary stop users from choosing settlement agreement
@ValidatorConstraint({ name: 'cannotChooseSettlementAgreement', async: false })
class ChooseHowToProceedValidator implements ValidatorConstraintInterface {
  validate(value: ChooseHowProceed) {
    return value !== ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
  }

  defaultMessage() {
    return 'ERRORS.THERE_IS_A_PROBLEM';
  }
}

export class ChooseHowToProceed {
  @Validate(ChooseHowToProceedValidator)
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
    option?: ChooseHowProceed;

  constructor(option?: ChooseHowProceed) {
    this.option = option;
  }
}
