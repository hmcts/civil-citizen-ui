import 'reflect-metadata';
import {Expose, Type} from 'class-transformer';
import {TableItem} from 'models/tableItem';

export class FeeRanges {
  value: FeeRange[];

  constructor(value: FeeRange[]) {
    this.value = [...value].sort(this.compare).filter((element: FeeRange, i : number) => !element.equals(value[i-1]));
  }

  compare(element1: FeeRange, element2: FeeRange) {
    if (element1.maxRange < element2.maxRange) {
      return -1;
    }
    if (element1.maxRange > element2.maxRange) {
      return 1;
    }
    return 0;
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

  formatFeeRangeToTableItem(): TableItem[] {
    if (this.minRange && this.maxRange && this.currentVersion?.flatAmount?.amount) {
      return [{text: `£${this.minRange.toLocaleString()} to £${this.maxRange.toLocaleString()}`}, {text: `£${this.currentVersion.flatAmount?.amount.toLocaleString()}`}];
    }
  }

  equals(feeRange: FeeRange) {
    return this.minRange === feeRange?.minRange && this.maxRange === feeRange?.maxRange;
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

  constructor(version: number, description: string, status: string, validTo: string, flatAmount: FlatAmount) {
    this.version = version;
    this.description = description;
    this.status = status;
    this.validTo = validTo;
    this.flatAmount = flatAmount;
  }

}

export class FlatAmount {
  readonly amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}


