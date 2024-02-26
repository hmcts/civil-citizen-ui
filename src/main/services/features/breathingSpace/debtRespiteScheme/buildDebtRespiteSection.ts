import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  BREATHING_SPACE_RESPITE_END_DATE_URL,
  BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL,
  BREATHING_SPACE_RESPITE_START_DATE_URL,
  BREATHING_SPACE_RESPITE_TYPE_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {BreathingSpace} from 'models/breathingSpace';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {DebtRespiteOptionType} from 'models/breathingSpace/debtRespiteOptionType';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});
export const buildDebtRespiteSection = (breathingSpace: BreathingSpace, claimId: string, lang: string ): SummarySection => {
  const lng = getLng(lang);
  const referenceNumber = breathingSpace?.debtRespiteReferenceNumber?.referenceNumber;
  const debtRespiteStartDate = (breathingSpace?.debtRespiteStartDate?.date)? formatDateToFullDate(breathingSpace?.debtRespiteStartDate?.date):'';
  const debtRespiteEndDate = (breathingSpace.debtRespiteEndDate?.date)? formatDateToFullDate(breathingSpace?.debtRespiteEndDate?.date):'';
  const debtRespiteOption = (breathingSpace?.debtRespiteOption?.type === DebtRespiteOptionType.STANDARD )?
    t('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE.STANDARD') :t('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE.MENTAL_HEALTH');

  return summarySection({
    title: '',
    summaryRows: [
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER', {lng}), referenceNumber, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START', {lng}), debtRespiteStartDate, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_START_DATE_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT', {lng}), debtRespiteOption, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_TYPE_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE', {lng}), debtRespiteEndDate, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_END_DATE_URL), changeLabel(lang)),
    ],
  });
};
