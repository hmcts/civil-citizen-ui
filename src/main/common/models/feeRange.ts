import 'reflect-metadata';
import {Expose, Type} from 'class-transformer';
import {TableItem} from 'models/tableItem';
import {t} from 'i18next';

export class FeeRanges {
  value: FeeRange[];

  constructor(value: FeeRange[]) {
    this.value = [...value].filter((element: FeeRange, i : number) => !element.equals(value[i-1]));
  }
}

export class FeeRange {
  @Expose({name: 'min_range'})
  readonly minRange: number;
  @Expose({name: 'max_range'})
  readonly maxRange: number;
  @Expose({name: 'current_version'})
  @Type(() => CurrentVersion)
  readonly currentVersion: CurrentVersion;

  constructor(minRange: number, maxRange: number, currentVersion: CurrentVersion) {
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.currentVersion = currentVersion;
  }

  equals(feeRange: FeeRange) {
    return this.minRange === feeRange?.minRange && this.maxRange === feeRange?.maxRange;
  }

  formatFeeRangeToTableItem(lang: string): TableItem[] {
    const minRange = this.maxRange ? `£${this.minRange?.toLocaleString()}` : ` > £${this.minRange?.toLocaleString()}`;
    const maxRange = this.maxRange ? ` to £${this.maxRange?.toLocaleString()}` : '';

    let feeAmount;
    if (this.currentVersion?.percentageAmount?.percentage) {
      const percentage = this.currentVersion?.percentageAmount?.percentage?.toLocaleString();
      feeAmount = {
        text: `${t('PAGES.SEND_YOUR_RESPONSE_BY_EMAIL.CLAIM_FEE', {percentage, lng: lang})}`,
      };
    } else {
      feeAmount = {
        text: `£${this.currentVersion?.flatAmount?.amount.toLocaleString()}`,
      };
    }
    return [{text: minRange + maxRange}, feeAmount];
  }

}

export class CurrentVersion {
  readonly version: number;
  readonly description: string;
  readonly status: string;
  @Expose({name: 'valid_to'})
  readonly validTo: string;
  @Expose({name: 'flat_amount'})
  @Type(() => FlatAmount)
  readonly flatAmount: FlatAmount;
  @Expose({name: 'percentage_amount'})
  @Type(() => PercentageAmount)
  readonly percentageAmount: PercentageAmount;

  constructor(version: number, description: string, status: string, validTo: string, flatAmount: FlatAmount, percentageAmount: PercentageAmount) {
    this.version = version;
    this.description = description;
    this.status = status;
    this.validTo = validTo;
    this.flatAmount = flatAmount;
    this.percentageAmount = percentageAmount;
  }

}

export class PercentageAmount {
  readonly percentage: number;

  constructor(percentage: number) {
    this.percentage = percentage;
  }
}

export class FlatAmount {
  readonly amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}
