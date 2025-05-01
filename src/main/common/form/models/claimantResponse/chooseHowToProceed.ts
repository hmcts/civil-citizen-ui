import {IsDefined, Validate, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import config from 'config';

// temporary stop users from choosing settlement agreement
@ValidatorConstraint({ name: 'cannotChooseSettlementAgreement', async: false })
class ChooseHowToProceedValidator implements ValidatorConstraintInterface {
  validate(value: ChooseHowProceed) {
    const sAEnabled = config.get<boolean>('featureToggles.settlementAgreementEnabled') || false;
    return value !== ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT || sAEnabled;
  }

  defaultMessage() {
    return 'ERRORS.FEATURE_UNAVAILABLE_GUIDANCE_BELOW';
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
