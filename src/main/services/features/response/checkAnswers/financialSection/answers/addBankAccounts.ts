import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_BANK_ACCOUNT_URL,
} from '../../../../../../routes/urls';

import {CitizenBankAccount} from '../../../../../../common/models/citizenBankAccount';
import {BankAccountTypeValues} from '../../../../../../common/form/models/bankAndSavings/bankAccountTypeValues';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';
import {YesNoUpperCase} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addBankAccounts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourBankAccountHref = CITIZEN_BANK_ACCOUNT_URL.replace(':id', claimId);
  if (claim.statementOfMeans?.bankAccounts) {
    const bankAccounts: CitizenBankAccount[] = claim.statementOfMeans.bankAccounts;
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.BANK_AND_SAVINGS_ACCOUNTS', {lng: getLng(lang)}), '', yourBankAccountHref, changeLabel(lang)));
    for (let i = 0; i < bankAccounts.length; i++) {
      let typeOfAccount: string;

      switch (bankAccounts[i].typeOfAccount) {
        case BankAccountTypeValues.CURRENT_ACCOUNT:
          typeOfAccount = t('PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT', {lng: getLng(lang)});
          break;
        case BankAccountTypeValues.SAVINGS_ACCOUNT:
          typeOfAccount = t('PAGES.CITIZEN_BANK_ACCOUNTS.SAVINGS_ACCOUNT', {lng: getLng(lang)});
          break;
        case BankAccountTypeValues.ISA:
          typeOfAccount = t('PAGES.CITIZEN_BANK_ACCOUNTS.ISA', {lng: getLng(lang)});
          break;
        case BankAccountTypeValues.OTHER:
          typeOfAccount = t('PAGES.CITIZEN_BANK_ACCOUNTS.OTHER', {lng: getLng(lang)});
          break;
        default:
      }

      const joint = bankAccounts[i].joint === 'true' ? YesNoUpperCase.YES : YesNoUpperCase.NO;
      financialSection.summaryList.rows.push(
        summaryRow((bankAccounts.length > 1 ? (i + 1) + '. ' : '') + t('COMMON.ACCOUNT_TYPE', {lng: getLng(lang)}), typeOfAccount, yourBankAccountHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.BANK_BALANCE', {lng: getLng(lang)}), currencyFormatWithNoTrailingZeros(Number(bankAccounts[i].balance)), yourBankAccountHref, changeLabel(lang)),
        summaryRow(t('COMMON.BANK_JOINT_ACCOUNT', {lng: getLng(lang)}), t(`COMMON.${joint}`, {lng: getLng(lang)}), yourBankAccountHref, changeLabel(lang)),
      );
    }
  } else {
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.BANK_AND_SAVINGS_ACCOUNTS', {lng: getLng(lang)}), 'None', yourBankAccountHref, changeLabel(lang)));
  }
};
