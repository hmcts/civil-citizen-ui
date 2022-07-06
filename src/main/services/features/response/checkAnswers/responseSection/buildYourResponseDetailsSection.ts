import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  CITIZEN_TIMELINE_URL,
  CITIZEN_EVIDENCE_URL,
} from '../../../../../routes/urls';
import { formatDateToFullDate } from '../../../../../common/utils/dateUtils';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

const addTimeline = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourTimelineHref = constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL);
  const timeline = claim.partialAdmission?.timeline;

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_TITLE', { lng: getLng(lang) }), '', yourTimelineHref, changeLabel(lang)),
  );

  for (let i = 0; i < timeline.rows.length; i++) {
    section.summaryList.rows.push(
      summaryRow(timeline.rows[i].date, timeline.rows[i].description, yourTimelineHref, changeLabel(lang)),
    );
  }

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS', { lng: getLng(lang) }), timeline.comment, '', changeLabel(lang)),
  );
};

const addEvidence = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourEvidenceHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL);
  const evidenceItem = claim.evidence?.evidenceItem;

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE', { lng: getLng(lang) }), '', yourEvidenceHref, changeLabel(lang)),
  );

  for (let i = 0; i < evidenceItem.length; i++) {
    section.summaryList.rows.push(
      summaryRow(evidenceItem[i].type, evidenceItem[i].description, yourEvidenceHref, changeLabel(lang)),
    );
  }

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS', { lng: getLng(lang) }), claim.evidence?.comment, yourEvidenceHref, changeLabel(lang)),
  );
};

export const buildYourResponseDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  const yourReasonsToDisagreeHref = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);

  let yourResponseDetailsSection: SummarySection = null;

  yourResponseDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  yourResponseDetailsSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(claim.partialAdmission?.howMuchHaveYouPaid?.amount)), yourResponseDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', { lng: getLng(lang) }), formatDateToFullDate(claim.partialAdmission?.howMuchHaveYouPaid?.date), '', changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUT_CLAIMED', { lng: getLng(lang) }), claim.partialAdmission?.howMuchHaveYouPaid?.text, '', changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }), claim.partialAdmission?.whyDoYouDisagree?.text, yourReasonsToDisagreeHref, changeLabel(lang)),
  ]);

  addTimeline(claim, claimId, lang, yourResponseDetailsSection);
  addEvidence(claim, claimId, lang, yourResponseDetailsSection);

  return yourResponseDetailsSection;
};
