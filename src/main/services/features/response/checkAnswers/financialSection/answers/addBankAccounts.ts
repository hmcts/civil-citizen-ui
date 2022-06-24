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
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addBankAccounts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourBankAccountHref = CITIZEN_BANK_ACCOUNT_URL.replace(':id', claimId);
  if (claim.statementOfMeans?.bankAccounts) {
    const bankAccounts: CitizenBankAccount[] = claim.statementOfMeans.bankAccounts;
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS', { lng: getLng(lang) }), '', yourBankAccountHref, changeLabel(lang)));
    for (let i = 0; i < bankAccounts.length; i++) {
      let typeOfAccount: string;

      switch (bankAccounts[i].typeOfAccount) {
        case BankAccountTypeValues.CURRENT_ACCOUNT:
          typeOfAccount = 'Current account';
          break;
        case BankAccountTypeValues.SAVINGS_ACCOUNT:
          typeOfAccount = 'Saving account';
          break;
        case BankAccountTypeValues.ISA:
          typeOfAccount = BankAccountTypeValues.ISA;
          break;
        case BankAccountTypeValues.OTHER:
          typeOfAccount = 'Other';
          break;
        default:
      }

      const joint = bankAccounts[i].joint === 'true' ? YesNo.YES : YesNo.NO;
      financialSection.summaryList.rows.push(
        summaryRow((bankAccounts.length > 1 ? (i + 1) + '. ' : '') + t('PAGES.CHECK_YOUR_ANSWER.BANK_TYPE_OF_ACCOUNT', { lng: getLng(lang) }), typeOfAccount, yourBankAccountHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.BANK_BALANCE', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(bankAccounts[i].balance)), yourBankAccountHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.BANK_JOINT_ACCOUNT', { lng: getLng(lang) }), joint.charAt(0).toUpperCase() + joint.slice(1), yourBankAccountHref, changeLabel(lang)),
      );
    }
  } else {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS', { lng: getLng(lang) }), 'None', yourBankAccountHref, changeLabel(lang)));
  }
};
