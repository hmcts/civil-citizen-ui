import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {convertToPoundInStringFormat} from 'services/translation/claim/moneyConversation';

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
        convertToPoundInStringFormat(ccdDebtItem.value?.totalOwed),
        convertToPoundInStringFormat(ccdDebtItem.value?.monthlyPayment),
      );
    });
  }
};
