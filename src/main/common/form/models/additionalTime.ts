import {IsDefined} from 'class-validator';

export enum AdditionalTimeOptions {
  MORE_THAN_28_DAYS = 'more-than-28-days',
  UP_TO_28_DAYS = 'up-to-28-days'
}

export class AdditionalTime {
  @IsDefined({message: 'ERRORS.SELECT_ADDITIONAL_TIME'})
    option?: AdditionalTimeOptions;

  constructor(additionalTimeOption?: AdditionalTimeOptions) {
    this.option = additionalTimeOption;
  }
}
