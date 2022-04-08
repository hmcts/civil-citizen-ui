import {CitizenAddress} from '../../main/common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../main/common/form/models/citizenCorrespondenceAddress';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {YesNo} from '../../main/common/form/models/yesNo';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';

export const buildCitizenAddress = (): CitizenAddress => {
  const citizenAddress =  new CitizenAddress();
  citizenAddress.primaryAddressLine1 = 'primaryAddressLine1';
  citizenAddress.primaryAddressLine2 = 'primaryAddressLine2';
  citizenAddress.primaryAddressLine3 = 'primaryAddressLine3';
  citizenAddress.primaryPostCode = 'primaryPostCode';
  citizenAddress.primaryCity = 'primaryCity';
  return  citizenAddress;
};

export const buildCitizenCorrespondenceAddress = () : CitizenCorrespondenceAddress => {
  const citizenCorrespondenceAddress = new CitizenCorrespondenceAddress();
  citizenCorrespondenceAddress.correspondenceAddressLine1 = 'correspondenceAddressLine1';
  citizenCorrespondenceAddress.correspondenceAddressLine2 = 'correspondenceAddressLine2';
  citizenCorrespondenceAddress.correspondenceAddressLine3 = 'correspondenceAddressLine3';
  citizenCorrespondenceAddress.correspondenceCity = 'correspondenceCity';
  citizenCorrespondenceAddress.correspondencePostCode = 'correspondencePostCode';
  return citizenCorrespondenceAddress;
};

export const buildDebtFormYes = () : Debts => {
  const debts = new Debts(YesNo.YES, buildDebtItems(1));
  return debts;
};

export const buildDebtFormNo = () : Debts => {
  const debts = new Debts(YesNo.NO, buildDebtItems(0));
  return debts;
};

export const buildDebtFormUndefined = () : Debts => {
  const debts = new Debts(undefined,undefined);
  return debts;
};

export const buildDebtFormYesWithoutItems = () : Debts => {
  const debts = new Debts(YesNo.YES,buildDebtItems(0));
  return debts;
};

export const buildDebtFormYesWithEmptyItems = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '1.00', '1.00'));
  items.push(new DebtItems('', '', ''));
  items.push(new DebtItems('test', '1.00', '1.00'));
  const debts = new Debts(YesNo.YES,items);
  return debts;
};
export const buildDebtFormYesWithDebtEmpty = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('', '1.00', '1.00'));
  const debts = new Debts(YesNo.YES,items);
  return debts;  return debts;
};

export const buildDebtFormYesWithTotalOwnedInvalid = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '-10', '1.00'));
  const debts = new Debts(YesNo.YES,items);
  return debts;  return debts;
};

export const buildDebtFormYesWithTotalOwnedZero = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '0', '1.00'));
  const debts = new Debts(YesNo.YES,items);
  return debts;  return debts;
};
export const buildDebtFormYesWithTotalOwnedEmpty = () : Debts => {
  const items : DebtItems[] = [];
  items.push(new DebtItems('test', '', '1.00'));
  const debts = new Debts(YesNo.YES,items);
  return debts;  return debts;
};

export const buildDebtItems = (totalOfRows: number) :  DebtItems[] =>{
  const items : DebtItems[] = [];
  for (let i = 0; i < totalOfRows; i++) {
    items.push(new DebtItems('test', '1.00', '1.00'));
  }
  return items;
};
