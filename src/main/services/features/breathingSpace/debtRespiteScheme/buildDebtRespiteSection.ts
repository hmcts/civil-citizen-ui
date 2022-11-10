import {SummarySection, summarySection} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {summaryRow} from '../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {
  BREATHING_SPACE_CHECK_ANSWERS_URL,
} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {DateFormatter} from '../../../../common/utils/dateFormatter';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});


export const getDateFormatted = () => {
  const date = new Date();
  DateFormatter.setMonth(date, 1);
  return DateFormatter.setDateFormat(date, 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

export const buildDebtRespiteSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const referenceNumberHref = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CHECK_ANSWERS_URL);
  const lng = getLng(lang);
  const dDebtRespiteSection = summarySection({
    title: '',
    summaryRows: [
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER', { lng }), '', referenceNumberHref, changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START', { lng }), getDateFormatted(), BREATHING_SPACE_CHECK_ANSWERS_URL, changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT', { lng }), '', BREATHING_SPACE_CHECK_ANSWERS_URL, changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE', {lng}), getDateFormatted(), BREATHING_SPACE_CHECK_ANSWERS_URL, changeLabel(lang)),
    ],
  });
  return dDebtRespiteSection;
};

