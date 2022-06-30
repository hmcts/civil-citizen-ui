import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
} from '../../../../../routes/urls';
import { formatDateToFullDate } from '../../../../../common/utils/dateUtils';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const buildYourResponseDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);

  let yourResponseDetailsSection: SummarySection = null;

  yourResponseDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  yourResponseDetailsSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(claim.partialAdmission?.howMuchHaveYouPaid?.amount)), yourResponseDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', { lng: getLng(lang) }), formatDateToFullDate(claim.partialAdmission?.howMuchHaveYouPaid?.date), '', changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUT_CLAIMED', { lng: getLng(lang) }), claim.partialAdmission?.howMuchHaveYouPaid?.text, '', changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }), claim.partialAdmission?.whyDoYouDisagree?.text , yourResponseDetailsHref, changeLabel(lang)),
  ]);

  return yourResponseDetailsSection;
};
