import {SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {CLAIM_TIMELINE_URL} from 'routes/urls';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addTimeLine = (claim: Claim, claimSection: SummarySection, claimId: string, lng: string) => {
  if (claim.claimDetails?.timeline) {
    claimSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_CLAIM_TITLE', {lng}), '', CLAIM_TIMELINE_URL, changeLabel(lng)),
    );
    const timeLine: TimelineRow[] = claim.claimDetails.timeline.rows;
    for (const item of timeLine) {
      claimSection.summaryList.rows.push(
        summaryRow(formatDateToFullDate(item.date, lng), item.description, CLAIM_TIMELINE_URL, changeLabel(lng)),
      );
    }
  }
};
