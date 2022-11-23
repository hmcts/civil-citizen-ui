import {getLng} from 'common/utils/languageToggleUtils';
import {SummarySection, summarySection} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';
import {buildExportReportSection} from './hearingExportsReportBuilderSection';

const buildHearingRequirementsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const hearingRequirementsSection = summarySection({
    title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
    summaryRows: [],
  });
  hearingRequirementsSection.summaryList.rows.push(... buildExportReportSection(claim, claimId, lng));
  return hearingRequirementsSection;
};

export {
  buildHearingRequirementsSection,
};
