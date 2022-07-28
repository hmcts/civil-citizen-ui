import {CitizenAddress} from '../../main/common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../main/common/form/models/citizenCorrespondenceAddress';
import {Debts} from '../../main/common/form/models/statementOfMeans/debts/debts';
import {YesNo} from '../../main/common/form/models/yesNo';
import {DebtItems} from '../../main/common/form/models/statementOfMeans/debts/debtItems';
import {GenericForm} from '../../main/common/form/models/genericForm';

export const buildCitizenAddress = (): GenericForm<CitizenAddress> => {
  const citizenAddress =  new CitizenAddress();
  citizenAddress.primaryAddressLine1 = 'primaryAddressLine1';
  citizenAddress.primaryAddressLine2 = 'primaryAddressLine2';
  citizenAddress.primaryAddressLine3 = 'primaryAddressLine3';
  citizenAddress.primaryPostCode = 'primaryPostCode';
  citizenAddress.primaryCity = 'primaryCity';
  return  new GenericForm<CitizenAddress>(citizenAddress);
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
