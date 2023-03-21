import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIDebts = (debtDeclared: YesNoUpperCamelCase, debtItems: CCDLoanCredit[]): Debts => {
  if (!debtDeclared) return undefined;
  return new Debts(
    toCUIYesNo(debtDeclared),
    toCUIDebtsList(debtItems),
  );
};

export const toCUIDebtsList = (ccdDebtItems: CCDLoanCredit[]): DebtItems[] => {
  if (!ccdDebtItems?.length) return undefined;
  return ccdDebtItems.map((ccdDebtItem: CCDLoanCredit) => {
    return new DebtItems(
      ccdDebtItem?.value?.loanCardDebtDetail,
      ccdDebtItem?.value?.totalOwed?.toString(),
      ccdDebtItem?.value?.monthlyPayment?.toString());
  });
};
