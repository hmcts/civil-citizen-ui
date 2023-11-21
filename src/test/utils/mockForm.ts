import {Address} from '../../main/common/form/models/address';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {YesNo} from '../../main/common/form/models/yesNo';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';
import {GenericForm} from '../../main/common/form/models/genericForm';
import {Party} from '../../main/common/models/party';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {PartyPhone} from '../../main/common/models/PartyPhone';

export const buildCitizenAddress = (): GenericForm<Address> => {
  const address = new Address();
  address.addressLine1 = 'addressLine1';
  address.addressLine2 = 'addressLine2';
  address.addressLine3 = 'addressLine3';
  address.postCode = 'postCode';
  address.city = 'city';
  return new GenericForm<Address>(address);
};

export const buildParty = (): GenericForm<Party> => {
  const party = new Party();
  party.partyDetails = new PartyDetailsCARM({});
  party.partyDetails.postToThisAddress = YesNo.NO;
  party.partyDetails.contactPerson = 'Jane Smith';
  party.partyPhone = new PartyPhone('123456');
  return new GenericForm<Party>(party);
};

export const buildDebtFormYes = (): Debts => {
  return new Debts(YesNo.YES, buildDebtItems(1));
};

export const buildDebtFormNo = (): Debts => {
  return new Debts(YesNo.NO, buildDebtItems(0));
};

export const buildDebtFormUndefined = (): Debts => {
  return new Debts(undefined, undefined);
};

export const buildDebtFormYesWithoutItems = (): Debts => {
  return new Debts(YesNo.YES, buildDebtItems(0));
};

export const buildDebtFormYesWithEmptyItems = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('test', '1.00', '1.00'));
  items.push(new DebtItems('', '', ''));
  items.push(new DebtItems('test', '1.00', '1.00'));
  return new Debts(YesNo.YES, items);
};
export const buildDebtFormYesWithDebtEmpty = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('', '1.00', '1.00'));
  return new Debts(YesNo.YES, items);
};

export const buildDebtFormYesWithTotalOwnedInvalid = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('test', '-10', '1.00'));
  return new Debts(YesNo.YES, items);
};

export const buildDebtFormYesWithTotalOwnedInvalidAndNoMonthlyPaymentsAndNoDebt = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('', '-10', ''));
  return new Debts(YesNo.YES, items);
};

export const buildDebtFormYesWithTotalOwnedZero = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('test', '0', '1.00'));
  return new Debts(YesNo.YES, items);

};
export const buildDebtFormYesWithTotalOwnedEmpty = (): Debts => {
  const items: DebtItems[] = [];
  items.push(new DebtItems('test', '', '1.00'));
  return new Debts(YesNo.YES, items);
};

export const buildDebtItems = (totalOfRows: number): DebtItems[] => {
  const items: DebtItems[] = [];
  for (let i = 0; i < totalOfRows; i++) {
    items.push(new DebtItems('test', '1.00', '1.00'));
  }
  return items;
};
