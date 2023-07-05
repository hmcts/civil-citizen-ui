import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIDebts = (debtDeclared: YesNoUpperCamelCase, debtItems: CCDLoanCredit[]): Debts => {
  if (debtDeclared) {
    return new Debts(
      toCUIYesNo(debtDeclared),
      toCUIDebtsList(debtItems),
    );
  }
};

const toCUIDebtsList = (ccdDebtItems: CCDLoanCredit[]): DebtItems[] => {
  if (ccdDebtItems?.length) {
    return ccdDebtItems.map((ccdDebtItem: CCDLoanCredit) => {
      return new DebtItems(
        ccdDebtItem.value?.loanCardDebtDetail,
        ccdDebtItem.value?.totalOwed ? (ccdDebtItem.value.totalOwed/100).toString() : undefined,
        ccdDebtItem.value?.monthlyPayment ? (ccdDebtItem.value.monthlyPayment/100).toString() : undefined,
      );
    });
  }
};
