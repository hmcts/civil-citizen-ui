import {ClaimantResponse} from '../../../common/models/claimantResponse';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {t} from 'i18next';
import {
  translateAccountType,
  translatePriorityDebt,
  translateRepaymentSchedule,
  translateResidenceType,
} from '../../genericService';
import {currencyFormatWithNoTrailingZeros} from '../../../common/utils/currencyFormat';
import {YesNo} from '../../../common/form/models/yesNo';
import {EmploymentCategory} from '../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {PriorityDebts} from '../../../common/form/models/statementOfMeans/priorityDebts';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {convertFrequencyToText, getFinalPaymentDate, getRepaymentFrequency, getRepaymentLength} from 'common/utils/repaymentUtils';
import {RepaymentPlan} from 'common/models/repaymentPlan';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

const getClaimantResponse = async (claimId: string): Promise<ClaimantResponse> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    return claim.claimantResponse ?? new ClaimantResponse();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantResponse = async (claimId: string, value: any, claimantResponsePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId, true);
    if (claim.claimantResponse) {
      if (parentPropertyName && claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName][claimantResponsePropertyName] = value;
      } else if (parentPropertyName && !claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      } else {
        claim.claimantResponse[claimantResponsePropertyName] = value;
      }
    } else {
      const claimantResponse: any = new ClaimantResponse();
      if (parentPropertyName) {
        claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      } else {
        claimantResponse[claimantResponsePropertyName] = value;
      }

      claim.claimantResponse = claimantResponse;
    }
    const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
    if (claimantResponse.suggestedPaymentIntention) {
      if (claimantResponse.isClaimantSuggestedPayImmediately || claimantResponse.isClaimantSuggestedPayByDate) {
        delete claim.claimantResponse.suggestedPaymentIntention?.repaymentPlan;
      }
      if (claimantResponse.isClaimantSuggestedPayImmediately || claimantResponse.isClaimantSuggestedPayByInstalments) {
        delete claim.claimantResponse?.suggestedPaymentIntention?.paymentDate;
      }
    }
    if (claim.hasClaimantRejectedDefendantPaid()) {
      logger.info('Removing hasPartPaymentBeenAccepted and rejectionReason fields from redis because of changing hasDefendantPaidYou from Yes to No');
      delete claim.claimantResponse?.hasPartPaymentBeenAccepted;
      delete claim.claimantResponse?.rejectionReason;
    }
    if (claim.hasClaimantSettleTheClaimForDefendantPartlyPaidAmount() || claim.hasClaimantAcceptedDefendantResponse()) {
      logger.info('Removing rejectionReason field from redis because of changing hasPartPaymentBeenAccepted from No to Yes');
      delete claim.claimantResponse?.rejectionReason;
    }
    await saveDraftClaim(claimId, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const constructRepaymentPlanSection = (claim: Claim, lng: string): Array<object> => {
  if(claim.isPartialAdmission()) {
    const repaymentPlan = claim.partialAdmission?.paymentIntention?.repaymentPlan;
    return repaymentPlanSummary(claim, lng, repaymentPlan);
  } else if(claim.isFullAdmission()) {
    const repaymentPlan = claim.fullAdmission?.paymentIntention?.repaymentPlan;
    return repaymentPlanSummary(claim, lng, repaymentPlan);
  }
};

export const repaymentPlanSummary = (claim: Claim, lng: string, repaymentPlan: RepaymentPlan): Array<object> => {
  return [
    {
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.REGULAR_PAYMENTS', {lng}),
      },
      value: {
        text: currencyFormatWithNoTrailingZeros(Number(repaymentPlan?.paymentAmount)),
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FREQUENCY_OF_PAYMENTS', {lng}),
      },
      value: {
        text: convertFrequencyToText(getRepaymentFrequency(claim), getLng(lng)),
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FIRST_PAYMENT_DATE', {lng}),
      },
      value: {
        text: formatDateToFullDate(repaymentPlan?.firstRepaymentDate, lng),
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FINAL_PAYMENT_DATE', {lng}),
      },
      value: {
        text: formatDateToFullDate(getFinalPaymentDate(claim), lng),
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.LENGTH', {lng}),
      },
      value: {
        text: getRepaymentLength(claim, lng),
      },
      classes: 'govuk-summary-list__row--no-border',
    },
  ];
};

const constructBanksAndSavingsAccountSection = (claim: Claim, lng: string) => {
  const sectionRows = [];

  if (claim.statementOfMeans?.bankAccounts) {
    const bankAccounts = claim.statementOfMeans?.bankAccounts;
    bankAccounts.forEach((account) => {
      sectionRows.push({
        key: {
          text: t('COMMON.ACCOUNT_TYPE', {lng}),
        },
        value: {
          text: translateAccountType(account.typeOfAccount, lng),
        },
        classes: 'govuk-summary-list__row--no-border',
      },
      {
        key: {
          text: t('COMMON.BALANCE', {lng}),
        },
        value: {
          text: currencyFormatWithNoTrailingZeros(parseFloat(account.balance)),
        },
        classes: 'govuk-summary-list__row--no-border',
      },
      {
        key: {
          text: t('COMMON.BANK_JOINT_ACCOUNT', {lng}),
        },
        value: {
          text: account?.joint === 'yes' ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
        },
      });
    });
  } else {
    sectionRows.push({
      key: {
        text: t('COMMON.ACCOUNT_TYPE', {lng}),
      },
      value: {
        text: '',
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('COMMON.BALANCE', {lng}),
      },
      value: {
        text: '',
      },
      classes: 'govuk-summary-list__row--no-border',
    },
    {
      key: {
        text: t('COMMON.BANK_JOINT_ACCOUNT', {lng}),
      },
      value: {
        text: '',
      },
    });
  }

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.WHERE_THEY_LIVE', {lng}),
    },
    value: {
      text: translateResidenceType(claim.statementOfMeans?.residence?.type, lng),
    },
  });

  return sectionRows;
};

const constructChildrenSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const declaredDependants = claim.statementOfMeans?.dependants?.declared;

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.CHILDREN_LIVING_WITH_THEM', {lng}),
    },
    value: {
      text: declaredDependants ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (declaredDependants) {
    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_UNDER_11', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.dependants?.numberOfChildren?.under11,
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_11_TO_15', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.dependants?.numberOfChildren?.between11and15,
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_16_TO_19', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.dependants?.numberOfChildren?.between16and19,
      },
    });

    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_16_TO_19_AND_EDUCATION', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.numberOfChildrenLivingWithYou,
      },
    });
  }

  return sectionRows;
};

const constructFinancialSupportSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const otherDependants = claim.statementOfMeans?.otherDependants?.option === YesNo.YES;

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.SUPPORT_ANYONE_ELSE', {lng}),
    },
    value: {
      text: otherDependants ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (otherDependants) {
    sectionRows.push({
      key: {
        text: t('COMMON.NUMBER_OF_PEOPLE', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.otherDependants?.numberOfPeople,
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('COMMON.GIVE_DETAILS', {lng}),
      },
      value: {
        text: claim.statementOfMeans?.otherDependants?.details,
      },
    });
  }

  return sectionRows;
};

const constructEmploymentDetailsSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const employment = claim.statementOfMeans?.employment;

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.EMPLOYED', {lng}),
    },
    value: {
      text: employment?.declared ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (employment?.declared) {
    const employers = claim.statementOfMeans?.employers;

    employment.employmentType.forEach((job) => {
      sectionRows.push({
        key: {
          text: t('COMMON.EMPLOYMENT_TYPE', {lng}),
        },
        value: {
          text: job === EmploymentCategory.EMPLOYED ?
            t('PAGES.EMPLOYMENT_STATUS.EMPLOYED', {lng}) :
            t('PAGES.EMPLOYMENT_STATUS.SELF_EMPLOYED', {lng}),
        },
      });
    });

    employers?.rows.forEach((employer) => {
      sectionRows.push({
        key: {
          text: t('COMMON.EMPLOYER_NAME', {lng}),
        },
        value: {
          text: employer.employerName,
        },
        classes: 'govuk-summary-list__row--no-border',
      });
      sectionRows.push({
        key: {
          text: t('COMMON.JOB_TITLE', {lng}),
        },
        value: {
          text: employer.jobTitle,
        },
      });
    });
  }

  return sectionRows;
};

const constructSelfEmploymentDetailsSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const isSelfEmployedAs = claim.getSelfEmployment();
  const behindOnTaxPayments = claim.getBehindOnTaxPayments();

  if (isSelfEmployedAs) {
    sectionRows.push({
      key: {
        text: t('COMMON.JOB_TITLE', {lng}),
      },
      value: {
        text: isSelfEmployedAs?.jobTitle,
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('COMMON.ANNUAL_TURNOVER', {lng}),
      },
      value: {
        text: currencyFormatWithNoTrailingZeros(isSelfEmployedAs?.annualTurnover),
      },
      classes: 'govuk-summary-list__row--no-border',
    });
  }

  if (behindOnTaxPayments) {
    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.BEHIND_ON_TAX_PAYMENTS', {lng}),
      },
      value: {
        text: claim.isBehindOnTheTaxPayments() ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AMOUNT_OWED', {lng}),
      },
      value: {
        text: currencyFormatWithNoTrailingZeros(behindOnTaxPayments?.amountOwed),
      },
      classes: 'govuk-summary-list__row--no-border',
    });

    sectionRows.push({
      key: {
        text: t('COMMON.REASON', {lng}),
      },
      value: {
        text: behindOnTaxPayments?.reason,
      },
    });
  }
  return sectionRows;
};

const constructMonthlyIncomeSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const regularIncome = claim.getRegularIncome();

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.RECEIVE_INCOME', {lng}),
    },
    value: {
      text: regularIncome ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
  });

  if (regularIncome) {
    // TODO: display their regular income
  }

  return sectionRows;
};

const constructMonthlyExpensesSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const regularExpenses = claim.getRegularExpenses();

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PAY_EXPENSES', {lng}),
    },
    value: {
      text: regularExpenses ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
  });

  if (regularExpenses) {
    // TODO: display their regular expenses
  }

  return sectionRows;
};

const constructCourtOrdersSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const courtOrders = claim.getCourtOrders();

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.COURT_ORDERS_TO_PAY', {lng}),
    },
    value: {
      text: courtOrders?.declared ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (courtOrders) {
    courtOrders?.rows?.forEach((courtOrder) => {

      sectionRows.push({
        key: {
          text: t('COMMON.CLAIM_NUMBER', {lng}),
        },
        value: {
          text: courtOrder?.claimNumber,
        },
        classes: 'govuk-summary-list__row--no-border',
      });

      sectionRows.push({
        key: {
          text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.AMOUNT_OWED', {lng}),
        },
        value: {
          text: currencyFormatWithNoTrailingZeros(courtOrder?.amount),
        },
      });
    });
  }

  return sectionRows;
};

const hasDebtAmount = (priorityDebts: PriorityDebts): boolean => {
  let amountFlag = false;
  if (priorityDebts) {
    const priorityDebtsKeys = Object.keys(priorityDebts);

    for (let i = 0; i <= priorityDebtsKeys.length; i++) {
      const priorityDebt = priorityDebts[priorityDebtsKeys[i] as keyof PriorityDebts];
      if (priorityDebt?.transactionSource?.amount) {
        amountFlag = true;
        break;
      }
    }

    return amountFlag;
  }
};

const constructDebtsSection = (claim: Claim, lng: string) => {
  const sectionRows = [];
  const priorityDebts = claim.getPriorityDebts();
  const debts = claim.getDebts();
  const haveDebts = debts?.option === 'yes';

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_BEHIND_ON', {lng}),
    },
    value: {
      text: hasDebtAmount(priorityDebts) ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (priorityDebts) {
    const priorityDebtsKeys = Object.keys(priorityDebts);
    priorityDebtsKeys.forEach((priorityDebtKey) => {
      const priorityDebt = priorityDebts[priorityDebtKey as keyof PriorityDebts] ;
      if (priorityDebt?.transactionSource?.amount) {
        sectionRows.push({
          key: {
            text: t('COMMON.DEBT', { lng }),
          },
          value: {
            text: translatePriorityDebt(priorityDebtKey, lng),
          },
          classes: 'govuk-summary-list__row--no-border',
        });

        sectionRows.push({
          key: {
            text: translateRepaymentSchedule(priorityDebt?.transactionSource?.schedule, lng),
          },
          value: {
            text: currencyFormatWithNoTrailingZeros(priorityDebt.transactionSource.amount),
          },
        });
      }
    });
  }

  sectionRows.push({
    key: {
      text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_LOAN_OR_CREDIT_CARD', {lng}),
    },
    value: {
      text: haveDebts ? t('COMMON.YES', {lng}) : t('COMMON.NO', {lng}),
    },
    classes: 'govuk-summary-list__row--no-border',
  });

  if (haveDebts) {
    debts?.debtsItems.forEach((debt) => {
      sectionRows.push({
        key: {
          text: t('COMMON.DEBT', {lng}),
        },
        value: {
          text: debt?.debt,
        },
        classes: 'govuk-summary-list__row--no-border',
      });

      sectionRows.push({
        key: {
          text: t('COMMON.TOTAL_DEBT', {lng}),
        },
        value: {
          text: currencyFormatWithNoTrailingZeros(parseFloat(debt?.totalOwned)),
        },
        classes: 'govuk-summary-list__row--no-border',
      });

      sectionRows.push({
        key: {
          text: t('COMMON.MONTHLY_PAYMENTS', {lng}),
        },
        value: {
          text: currencyFormatWithNoTrailingZeros(parseFloat(debt?.monthlyPayments)),
        },
      });
    });
  }

  return sectionRows;
};

const getFinancialDetails = (claim: Claim, lang: string): object[] => {
  const lng = getLng(lang);
  return [
    constructBanksAndSavingsAccountSection(claim, lng),
    constructChildrenSection(claim, lng),
    constructFinancialSupportSection(claim, lng),
    constructEmploymentDetailsSection(claim, lng),
    constructSelfEmploymentDetailsSection(claim, lng),
    constructMonthlyIncomeSection(claim, lng),
    constructMonthlyExpensesSection(claim, lng),
    constructCourtOrdersSection(claim, lng),
    constructDebtsSection(claim, lng),
  ];
};

export {
  constructBanksAndSavingsAccountSection,
  constructChildrenSection,
  constructFinancialSupportSection,
  constructEmploymentDetailsSection,
  constructSelfEmploymentDetailsSection,
  constructMonthlyIncomeSection,
  constructMonthlyExpensesSection,
  constructCourtOrdersSection,
  constructDebtsSection,
  constructRepaymentPlanSection,
  getFinancialDetails,
  getClaimantResponse,
  saveClaimantResponse,
};
