import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from '../../../../../../routes/urls';

import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';
import {YesNoUpperCase} from '../../../../../../common/form/models/yesNo';
import {EmploymentCategory} from '../../../../../../common/form/models/statementOfMeans/employment/employmentCategory';
import {UnemploymentCategory} from '../../../../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {Unemployment} from '../../../../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {Employment} from '../../../../../../common/models/employment';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

const getTypeOfJobTranslation = (employment: Employment, lang: string | unknown): string => {
  const tEmployed = t('PAGES.EMPLOYMENT_STATUS.EMPLOYED', { lng: getLng(lang) });
  const tSelfEmployed = t('PAGES.EMPLOYMENT_STATUS.SELF_EMPLOYED', { lng: getLng(lang) });
  const tEmployedAndSelfEmployed = t('PAGES.CHECK_YOUR_ANSWER.EMPLOYED_AND_SELF_EMPLOYED', { lng: getLng(lang) });

  const getTypeOfJob = (type: string) => type === EmploymentCategory.EMPLOYED ? tEmployed : tSelfEmployed;
  const typeOfJobsArr: Array<string> = [];
  for (const item of employment.employmentType) {
    typeOfJobsArr.push(getTypeOfJob(item));
  }

  return typeOfJobsArr.length > 1 ? tEmployedAndSelfEmployed : typeOfJobsArr[0];
};

const showSelfEmploymentTaxPayments = (claim: Claim, financialSection: SummarySection, lang: string | unknown) => {
  const taxPayments = claim.statementOfMeans?.taxPayments;
  const isBehindTaxPayments = taxPayments?.owed ? YesNoUpperCase.YES : YesNoUpperCase.NO;

  if (taxPayments?.owed) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_ARE_YOU_BEHIND', { lng: getLng(lang) }), t(`COMMON.${isBehindTaxPayments}`, {lng: getLng(lang)}), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_AMOUNT_YOU_OWE', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(taxPayments.amountOwed), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.REASON', { lng: getLng(lang) }), taxPayments.reason, '', changeLabel(lang)));
  } else {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_ARE_YOU_BEHIND', { lng: getLng(lang) }), t(`COMMON.${isBehindTaxPayments}`, {lng: getLng(lang)}), '', changeLabel(lang)));
  }
};

const showEmploymentDetails = (claim: Claim, financialSection: SummarySection, employment: Employment, whoEmploysYouHref: string, selfemploymentHref: string, lang: string | unknown) => {
  const isSelfEmployedAs = claim.statementOfMeans?.selfEmployedAs;

  financialSection.summaryList.rows.push(summaryRow(t('COMMON.EMPLOYMENT_TYPE', { lng: getLng(lang) }), getTypeOfJobTranslation(employment, lang), '', changeLabel(lang)));

  if (claim.statementOfMeans?.employers?.rows
    && ((employment.employmentType[0] === EmploymentCategory.EMPLOYED && employment.employmentType[1] === EmploymentCategory.SELF_EMPLOYED) || employment.employmentType[0] === EmploymentCategory.EMPLOYED)) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_WHO_EMPLOYS_YOU', { lng: getLng(lang) }), '', whoEmploysYouHref, changeLabel(lang)));
    for (const item of claim.statementOfMeans.employers.rows) {
      financialSection.summaryList.rows.push(summaryRow(t('COMMON.EMPLOYER_NAME', { lng: getLng(lang) }), item.employerName, '', changeLabel(lang)));
      financialSection.summaryList.rows.push(summaryRow(t('COMMON.JOB_TITLE', { lng: getLng(lang) }), item.jobTitle, '', changeLabel(lang)));
    }
  }

  if (isSelfEmployedAs) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_SELF_DETAILS', { lng: getLng(lang) }), '', selfemploymentHref, changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.JOB_TITLE', { lng: getLng(lang) }), isSelfEmployedAs.jobTitle, '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.ANNUAL_TURNOVER', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(isSelfEmployedAs.annualTurnover), '', changeLabel(lang)));
    showSelfEmploymentTaxPayments(claim, financialSection, lang);
  }
};

const showUnemploymentDetails = (financialSection: SummarySection, unemployment: Unemployment, lang: string | unknown) => {
  let unemploymentLengthOrOther: string;
  const years = unemployment?.unemploymentDetails?.years;
  const months = unemployment?.unemploymentDetails?.months;

  switch (unemployment?.option) {
    case UnemploymentCategory.UNEMPLOYED:
      unemploymentLengthOrOther = t('PAGES.CHECK_YOUR_ANSWER.UNEMPLOYMENT_FOR', {lng: getLng(lang), unemployedYears: years, unemployedMonths: months});
      break;
    case UnemploymentCategory.OTHER:
      unemploymentLengthOrOther = unemployment?.otherDetails?.details;
      break;
    case UnemploymentCategory.RETIRED:
      unemploymentLengthOrOther = unemployment?.option;
      break;
    default:
  }

  financialSection.summaryList.rows.push(summaryRow(t('COMMON.EMPLOYMENT_TYPE', { lng: getLng(lang) }), unemploymentLengthOrOther, '', changeLabel(lang)));
};

export const addEmploymentDetails = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourEmploymentHref = CITIZEN_EMPLOYMENT_URL.replace(':id', claimId);
  const whoEmploysYouHref = CITIZEN_WHO_EMPLOYS_YOU_URL.replace(':id', claimId);
  const yourSelfEmploymentHref = CITIZEN_SELF_EMPLOYED_URL.replace(':id', claimId);
  const employment = claim.statementOfMeans?.employment;
  const hasAjob = employment?.declared ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const unemployment = claim.statementOfMeans?.unemployment;

  financialSection.summaryList.rows.push(
    summaryRow(t('COMMON.EMPLOYMENT_DETAILS', { lng: getLng(lang) }), '', yourEmploymentHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DO_YOU_HAVE_A_JOB', { lng: getLng(lang) }), t(`COMMON.${hasAjob}`, {lng: getLng(lang)}), yourEmploymentHref, changeLabel(lang)),
  );

  if (employment?.declared && employment) {
    showEmploymentDetails(claim,financialSection,employment,whoEmploysYouHref,yourSelfEmploymentHref,lang);
  } else {
    showUnemploymentDetails(financialSection,unemployment,lang);
  }
};
