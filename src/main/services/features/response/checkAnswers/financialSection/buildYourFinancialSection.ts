

import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';

import {addBankAccounts} from './answers/addBankAccounts';
import {addDisability} from './answers/addDisability';
import {addResidence} from './answers/addResidence';
import {addPartner} from './answers/addPartner';
import {addDependants} from './answers/addDependants';
import {addOtherDependants} from './answers/addOtherDependants';
import {addCarer} from './answers/addCarer';
import {addEmploymentDetails} from './answers/addEmploymentDetails';
import {addCourtOrders} from './answers/addCourtOrders';
import {addPriorityDebts} from './answers/addPriorityDebts';
import {addLoansOrCreditCardDebts} from './answers/addLoansOrCreditCardDebts';
import {addMonthlyExpenses} from './answers/addMonthlyExpenses';
import {addMonthlyIncome} from './answers/addMonthlyIncome';


//const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });


export const buildYourFinancialSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let yourFinancialSection: SummarySection = null;

  yourFinancialSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE', { lng: getLng(lang) }),
    summaryRows: [],
  });

  // -- Bank Accounts
  addBankAccounts(claim, yourFinancialSection, claimId, lang);
  // -- Disability
  addDisability(claim, yourFinancialSection, claimId, lang);
  // -- Residence
  addResidence(claim, yourFinancialSection, claimId, lang);
  // -- Partner
  addPartner(claim, yourFinancialSection, claimId, lang);
  // -- Dependants
  addDependants(claim, yourFinancialSection, claimId, lang);
  // -- Other Dependants
  addOtherDependants(claim, yourFinancialSection, claimId, lang);
  // -- Carer’s Allowance or Carer’s Credit
  addCarer(claim, yourFinancialSection, claimId, lang);
  // -- Employment Details
  addEmploymentDetails(claim, yourFinancialSection, claimId, lang);
  // -- Court Orders
  addCourtOrders(claim, yourFinancialSection, claimId, lang);
  // -- Priority Debts
  addPriorityDebts(claim, yourFinancialSection, claimId, lang);
  // -- Loans or Credit Card Debts
  addLoansOrCreditCardDebts(claim, yourFinancialSection, claimId, lang);
  // -- Regular Expenses
  addMonthlyExpenses(claim, yourFinancialSection, claimId, lang);
  // -- Regular Income
  addMonthlyIncome(claim, yourFinancialSection, claimId, lang);

  return yourFinancialSection;
};
