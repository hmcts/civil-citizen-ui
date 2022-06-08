import {SummarySection, summarySection, SummarySections} from '../../../common/models/summaryList/summarySections';
import {Claim} from '../../../common/models/claim';
import {SummaryRow, summaryRow} from '../../../common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_EXPLANATION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_REPAYMENT_PLAN,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_PRIORITY_DEBTS_URL,
  CITIZEN_DEBTS_URL,
} from '../../../routes/urls';
import {t} from 'i18next';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {PrimaryAddress} from '../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../common/models/correspondenceAddress';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import PaymentOptionType from '../../../common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

import {CitizenBankAccount} from '../../../common/models/citizenBankAccount';
import {DebtItems} from '../../../common/form/models/statementOfMeans/debts/debtItems';
import {currencyFormatWithNoTrailingZeros} from '../../../common/utils/currencyFormat';
import {PriorityDebtDetails} from '../../../common/form/models/statementOfMeans/priorityDebtDetails';
import {YesNo} from '../../../common/form/models/yesNo';
import {BankAccountTypeValues} from '../../../common/form/models/bankAndSavings/bankAccountTypeValues';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

let count: number;

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address.AddressLine1 + '<br>' + address.PostTown + '<br>' + address.PostCode;
};


const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1.individualFirstName && claim.respondent1.individualLastName) {
    return claim.respondent1.individualTitle + ' ' + claim.respondent1.individualFirstName + ' ' + claim.respondent1.individualLastName;
  }
  return claim.respondent1.partyName;
};

const getPaymentOption = (claim: Claim, lang: string | unknown): string => {
  const option = t(`COMMON.PAYMENT_OPTION.${claim.paymentOption}`, {lng: getLng(lang)});
  if (claim.isPaymentOptionBySetDate()) {
    return option + ': ' + formatDateToFullDate(claim.paymentDate);
  }
  return option;
};

const getResponseTitle = (claim: Claim, lang: string | unknown): string => {
  if (claim.isPaymentOptionPayImmediately()) {
    return t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)});
  }
  return t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE', {lng: getLng(lang)});
};

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildResponseSection(claim, claimId, lang),
      buildYourFinancialSection(claim, claimId, lang),
    ],
  };
};

const buildExplanationRow = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow => {
  const explanationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL);
  return summaryRow(t('PAGES.EXPLANATION.TITLE', {lng: getLng(lang)}), claim.statementOfMeans?.explanation?.text, explanationHref, changeLabel(lang));
};

const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng: getLng(lang)}), getDefendantFullName(claim), yourDetailsHref, changeLabel(lang)),
    ],
  });
  if (claim.respondent1.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng: getLng(lang)}), claim.respondent1.contactPerson, yourDetailsHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng: getLng(lang)}), addressToString(claim.respondent1.primaryAddress), yourDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng: getLng(lang)}), claim.respondent1.correspondenceAddress ? addressToString(claim.respondent1.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng: getLng(lang)}), yourDetailsHref, changeLabel(lang))]);
  if (claim.respondent1.dateOfBirth) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng: getLng(lang)}), formatDateToFullDate(claim.respondent1.dateOfBirth), yourDOBHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng: getLng(lang)}), claim.respondent1.telephoneNumber, phoneNumberHref, changeLabel(lang)));
  return yourDetailsSection;
};


const addBankAccounts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
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

const addPriorityDebtsListRow = (section:SummarySection, sectionHref:string, debtType:PriorityDebtDetails, tKey:string, lang: string | unknown) => {
  if (debtType?.isDeclared && debtType?.amount) {
    section.summaryList.rows.push(summaryRow((count++) + '. ' + t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_TYPE', { lng: getLng(lang) }), t(tKey, { lng: getLng(lang) }), sectionHref, changeLabel(lang)));
    section.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ARREARS_REPAYMENT', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(debtType.amount), sectionHref, changeLabel(lang)));
  }
};

const addPriorityDebts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourPriorityDebtsHref = CITIZEN_PRIORITY_DEBTS_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.priorityDebts) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBTS_YOU_ARE_BEHIND_ON', { lng: getLng(lang) }), '', yourPriorityDebtsHref, changeLabel(lang)),
    );
  }

  count = 1;
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.mortgage, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MORTGAGE', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.rent, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_RENT', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.councilTax, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_COUNCIL_TAX', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.gas, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_GAS', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.electricity, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ELECTRICITY', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.water, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_WATER', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.maintenance, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MAINTENANCE', lang);
};

const addLoansOrCreditCardDebts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourLoansOrCreditCardsDebtsHref = CITIZEN_DEBTS_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.debts?.debtsItems) {
    const debtsItems: DebtItems[] = claim.statementOfMeans.debts.debtsItems;
    const option = claim.statementOfMeans.debts.option;
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DEBTS_LOANS_OR_CREDIT_CARDS', { lng: getLng(lang) }), option.charAt(0).toUpperCase() + option.slice(1), yourLoansOrCreditCardsDebtsHref, changeLabel(lang)));
    for (let i = 0; i < debtsItems.length; i++) {
      financialSection.summaryList.rows.push(
        summaryRow((debtsItems.length > 1 ? (i + 1) + '. ' : '') + t('PAGES.CHECK_YOUR_ANSWER.DEBT', { lng: getLng(lang) }), debtsItems[i].debt, '', changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DEBTS_TOTAL_OWED', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(debtsItems[i].totalOwned)), '', changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DEBTS_MONTHLY_PAYMENTS', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(debtsItems[i].monthlyPayments)), '', changeLabel(lang)),
      );
    }
  }
};


// -- FINANCIAL SECTION
const buildYourFinancialSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  let yourFinancialSection: SummarySection = null;

  yourFinancialSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE', { lng: getLng(lang) }),
    summaryRows: [],
  });

  // -- Bank Accounts
  addBankAccounts(claim, yourFinancialSection, claimId, lang);
  // -- Priority Debts
  addPriorityDebts(claim, yourFinancialSection, claimId, lang);
  // -- Loans or Credit Card Debts
  addLoansOrCreditCardDebts(claim, yourFinancialSection, claimId, lang);

  return yourFinancialSection;
}; // -- End



const buildResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  const responseSection = summarySection({
    title: getResponseTitle(claim, lang),
    summaryRows: [],
  });
  switch (claim.paymentOption) {
    case PaymentOptionType.IMMEDIATELY:
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', {lng: getLng(lang)}), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, {lng: getLng(lang)}), yourResponseHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)),
      ]);
      break;
    case PaymentOptionType.BY_SET_DATE:
      responseSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)), buildExplanationRow(claim, claimId, lang)]);
      break;
    case PaymentOptionType.INSTALMENTS: {
      const repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN);
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', {lng: getLng(lang)}), `£${claim.repaymentPlan.paymentAmount}`, repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_FREQUENCY.${claim.repaymentPlan.repaymentFrequency}`, {lng: getLng(lang)}), repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT', {lng: getLng(lang)}), formatDateToFullDate(claim.repaymentPlan.firstRepaymentDate), repaymentPlanHref, changeLabel(lang)),
        buildExplanationRow(claim, claimId, lang),
      ]);
    }
  }
  return responseSection;
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};

export const getStatementOfTruth = (claim: Claim) => {
  if (claim.defendantStatementOfTruth) {
    return claim.defendantStatementOfTruth;
  }
  return new StatementOfTruthForm();
};

export const saveStatementOfTruth = async (claimId: string, defendantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.defendantStatementOfTruth = defendantStatementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
