import {SummarySection, summarySection} from '../../../../common/models/summaryList/summarySections';
import {summaryRow} from '../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {
  BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL,
  BREATHING_SPACE_RESPITE_END_DATE_URL,
  BREATHING_SPACE_RESPITE_START_DATE_URL,
  BREATHING_SPACE_RESPITE_TYPE_URL,
} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {BreathingSpace} from 'models/breathingSpace';
import {formatDateToFullDate} from 'common/utils/dateUtils';


const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});
export const buildDebtRespiteSection = (breathingSpace: BreathingSpace, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const referenceNumber = breathingSpace?.debtRespiteReferenceNumber?.referenceNumber;
  const debtRespiteStartDate = (breathingSpace.debtRespiteStartDate)? formatDateToFullDate(breathingSpace?.debtRespiteStartDate?.date):'';
  const debtRespiteEndDate = (breathingSpace.debtRespiteEndDate)? formatDateToFullDate(breathingSpace?.debtRespiteEndDate?.date):'';
  const breathingType = (breathingSpace?.debtRespiteOption)? t('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE' + '.' + breathingSpace?.debtRespiteOption?.type):'';

  return summarySection({
    title: '',
    summaryRows: [
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER', {lng}), referenceNumber, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START', {lng}), debtRespiteStartDate, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_START_DATE_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT', {lng}), breathingType, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_TYPE_URL), changeLabel(lang)),
      summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE', {lng}), debtRespiteEndDate, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_END_DATE_URL), changeLabel(lang)),
    ],
  });
};
