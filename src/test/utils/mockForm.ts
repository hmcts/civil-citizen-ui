import {Address} from '../../main/common/form/models/address';
import {CitizenCorrespondenceAddress} from '../../main/common/form/models/citizenCorrespondenceAddress';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {YesNo} from '../../main/common/form/models/yesNo';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';
import {GenericForm} from '../../main/common/form/models/genericForm';

export const buildCitizenAddress = (): GenericForm<Address> => {
  const address =  new Address();
  address.primaryAddressLine1 = 'primaryAddressLine1';
  address.primaryAddressLine2 = 'primaryAddressLine2';
  address.primaryAddressLine3 = 'primaryAddressLine3';
  address.primaryPostCode = 'primaryPostCode';
  address.primaryCity = 'primaryCity';
  return  new GenericForm<Address>(address);
};

export const buildCitizenCorrespondenceAddress = () : GenericForm<CitizenCorrespondenceAddress> => {
  const citizenCorrespondenceAddress = new CitizenCorrespondenceAddress();
  citizenCorrespondenceAddress.correspondenceAddressLine1 = 'correspondenceAddressLine1';
  citizenCorrespondenceAddress.correspondenceAddressLine2 = 'correspondenceAddressLine2';
  citizenCorrespondenceAddress.correspondenceAddressLine3 = 'correspondenceAddressLine3';
  citizenCorrespondenceAddress.correspondenceCity = 'correspondenceCity';
  citizenCorrespondenceAddress.correspondencePostCode = 'correspondencePostCode';
  return new GenericForm<CitizenCorrespondenceAddress>(citizenCorrespondenceAddress);
};

export const buildDebtFormYes = () : Debts => {
  return new Debts(YesNo.YES, buildDebtItems(1));
};

export const buildDebtFormNo = () : Debts => {
  return new Debts(YesNo.NO, buildDebtItems(0));
};

export const buildDebtFormUndefined = () : Debts => {
  return new Debts(undefined,undefined);
};

export const buildDebtFormYesWithoutItems = () : Debts => {
  return new Debts(YesNo.YES,buildDebtItems(0));
};

export const buildDebtFormYesWithEmptyItems = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '1.00', '1.00'));
  items.push(new DebtItems('', '', ''));
  items.push(new DebtItems('test', '1.00', '1.00'));
  return new Debts(YesNo.YES,items);
};
export const buildDebtFormYesWithDebtEmpty = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('', '1.00', '1.00'));
  return new Debts(YesNo.YES,items);
};

export const buildDebtFormYesWithTotalOwnedInvalid = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '-10', '1.00'));
  return new Debts(YesNo.YES,items);
};

export const buildDebtFormYesWithTotalOwnedInvalidAndNoMonthlyPaymentsAndNoDebt = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('','-10',''));
  return new Debts(YesNo.YES,items);
};

export const buildDebtFormYesWithTotalOwnedZero = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '0', '1.00'));
  return new Debts(YesNo.YES,items);

};
export const buildDebtFormYesWithTotalOwnedEmpty = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '', '1.00'));
  return new Debts(YesNo.YES,items);
};

export const buildDebtItems = (totalOfRows: number) :  DebtItems[] =>{
  const items : DebtItems[] = [];
  for (let i = 0; i < totalOfRows; i++) {
    items.push(new DebtItems('test', '1.00', '1.00'));
  }
  return items;
};
