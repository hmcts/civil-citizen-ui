import {BreathingSpace} from 'models/breathingSpace';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {BREATHING_SPACE_RESPITE_LIFTED_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {getLng} from 'common/utils/languageToggleUtils';

export const getSummarySections = (claimId: string, breathingSpace: BreathingSpace, lang?: string): SummarySection => {
  const lng = getLng(lang);
  const breathingSpaceLiftedDate = breathingSpace.debtRespiteLiftDate?.date ? formatDateToFullDate(breathingSpace?.debtRespiteLiftDate?.date) : '';
  return summarySection(
    {
      title: '',
      summaryRows: [
        summaryRow(t('PAGES.CLAIMANT_LIFT_BREATHING_SPACE_CHECK_ANSWER.DATE_LIFTED', {lng}), breathingSpaceLiftedDate, constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_RESPITE_LIFTED_URL), changeLabel(lng)),
      ],
    });
};
