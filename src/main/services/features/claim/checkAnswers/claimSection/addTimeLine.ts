import {SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {CLAIM_TIMELINE_URL} from 'routes/urls';
import {TimelineRow} from '../../../../../common/form/models/timeLineOfEvents/timelineRow';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addTimeLine = (claim: Claim, claimSection: SummarySection, claimId: string, lang: string | unknown) => {
  if (claim.claimDetails?.timeline) {
    claimSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_CLAIM_TITLE', {lang}), '', CLAIM_TIMELINE_URL, changeLabel(lang)),
    );
    const timeLine: TimelineRow[] = claim.claimDetails.timeline.rows;
    for (let i = 0; i < timeLine.length; i++) {
      claimSection.summaryList.rows.push(
        summaryRow(formatDateToFullDate(timeLine[i].date, lang), timeLine[i].description, CLAIM_TIMELINE_URL, changeLabel(lang)),
      );
    }
  }
};
