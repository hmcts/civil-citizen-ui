import {SummarySection, summarySection} from '../../../../common/models/summaryList/summarySections';
import {summaryRow} from '../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {
    BREATHING_SPACE_CHECK_ANSWERS_URL,
    BREATHING_SPACE_RESPITE_END_DATE_URL,
    BREATHING_SPACE_RESPITE_START_DATE_URL,
    BREATHING_SPACE_RESPITE_TYPE_URL,
} from '../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {BreathingSpace} from 'models/breathingSpace';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});
export const buildDebtRespiteSection = (breathingSpace: BreathingSpace, claimId: string, lang: string | unknown): SummarySection => {
    const referenceNumberHref = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_CHECK_ANSWERS_URL);
    const debtRespiteStartDateHref = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_START_DATE_URL);
    const debtRespiteOptionDateHref = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_TYPE_URL);
    const debtRespiteEndDateHref = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_END_DATE_URL);

    const lng = getLng(lang);
    const referenceNumber = breathingSpace?.debtRespiteReferenceNumber?.referenceNumber ?? '';
    const breathingType = 'PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE' + '.' + breathingSpace.debtRespiteOption.type;

    return summarySection({
        title: '',
        summaryRows: [
            summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.REFERENCE_NUMBER', {lng}), referenceNumber, referenceNumberHref, changeLabel(lang)),
            summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.WHEN_DID_IT_START', {lng}), formatDateToFullDate(breathingSpace.debtRespiteStartDate.date), debtRespiteStartDateHref, changeLabel(lang)),
            summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.TYPE.WHAT_TYPE_IS_IT', {lng}), t(breathingType), debtRespiteOptionDateHref, changeLabel(lang)),
            summaryRow(t('PAGES.CLAIMANT_DEBT_RESPITE_CHECK_ANSWERS.EXPECTED_END_DATE', {lng}), formatDateToFullDate(breathingSpace.debtRespiteEndDate.date), debtRespiteEndDateHref, changeLabel(lang)),
        ],
    });
};
