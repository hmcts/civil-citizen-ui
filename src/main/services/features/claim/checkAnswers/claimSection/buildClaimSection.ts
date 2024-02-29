import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {addTimeLine} from './addTimeLine';
import {addEvidence} from './addEvidence';
import {summaryRow} from 'models/summaryList/summaryList';
import {CLAIM_REASON_URL} from 'routes/urls';

export const buildClaimSection = (claim: Claim, claimId: string, lang: string): SummarySection => {

  const lng = getLng(lang);
  const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: lng});
  const claimSection = summarySection({
    title: t('PAGES.CLAIM_DETAILS.PAGE_TITLE', {lng}),
    summaryRows: [],
  });
  claimSection.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REASON_TITLE', {lng}), claim.claimDetails?.reason?.text, CLAIM_REASON_URL, changeLabel(lang)),
  );
  addTimeLine(claim, claimSection, claimId, lng);
  addEvidence(claim, claimSection, claimId, lng);

  return claimSection;
};
