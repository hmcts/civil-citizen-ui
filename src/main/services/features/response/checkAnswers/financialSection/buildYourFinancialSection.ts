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

export const buildYourFinancialSection = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  let yourFinancialSection: SummarySection = null;

  yourFinancialSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_FINANCIAL_DETAILS_TITLE', { lng: getLng(lang) }),
    summaryRows: [],
  });

  addBankAccounts(claim, yourFinancialSection, claimId, lang);
  addDisability(claim, yourFinancialSection, claimId, lang);
  addResidence(claim, yourFinancialSection, claimId, lang);
  addPartner(claim, yourFinancialSection, claimId, lang);
  addDependants(claim, yourFinancialSection, claimId, lang);
  addOtherDependants(claim, yourFinancialSection, claimId, lang);
  addCarer(claim, yourFinancialSection, claimId, lang);
  addEmploymentDetails(claim, yourFinancialSection, claimId, lang);
  addCourtOrders(claim, yourFinancialSection, claimId, lang);
  addPriorityDebts(claim, yourFinancialSection, claimId, lang);
  addLoansOrCreditCardDebts(claim, yourFinancialSection, claimId, lang);
  addMonthlyExpenses(claim, yourFinancialSection, claimId, lang);
  addMonthlyIncome(claim, yourFinancialSection, claimId, lang);

  return yourFinancialSection;
};
