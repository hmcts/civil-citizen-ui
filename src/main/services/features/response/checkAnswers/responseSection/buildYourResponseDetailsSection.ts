import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {DefendantTimeline} from '../../../../../common/form/models/timeLineOfEvents/defendantTimeline';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {ResponseType} from '../../../../../common/form/models/responseType';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

const addTimeline = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourTimelineHref = constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL);
  const timeline = claim.partialAdmission?.timeline ? claim.partialAdmission.timeline : new DefendantTimeline([], '');

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_TITLE', {lng: getLng(lang)}), '', yourTimelineHref, changeLabel(lang)),
  );

  for (const item of timeline.rows) {
    section.summaryList.rows.push(
      summaryRow(item.date, item.description, yourTimelineHref, changeLabel(lang)),
    );
  }

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS', {lng: getLng(lang)}), timeline.comment, yourTimelineHref, changeLabel(lang)),
  );
};

const addEvidence = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourEvidenceHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL);
  const evidenceItem = claim.evidence?.evidenceItem;

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE', {lng: getLng(lang)}), '', yourEvidenceHref, changeLabel(lang)),
  );
  if (evidenceItem) {
    for (const item of evidenceItem) {
      section.summaryList.rows.push(
        summaryRow(item.type, item.description, yourEvidenceHref, changeLabel(lang)),
      );
    }
  }
  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS', {lng: getLng(lang)}), claim.evidence?.comment, yourEvidenceHref, changeLabel(lang)),
  );
};

const getSummaryRowsForPartAdmission = (claim: Claim, claimId: string, lang: string | unknown, yourResponseDetailsSection: SummarySection) => {
  const yourResponseDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  const yourReasonsToDisagreeHref = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);
  const howMuchYouAdmitYouOweHref = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);

  if (claim.partialAdmission.alreadyPaid?.option === YesNo.NO) {
    yourResponseDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_YOU_ADMIT_YOU_OWE', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(claim.partialAdmission.howMuchDoYouOwe.amount)), howMuchYouAdmitYouOweHref, changeLabel(lang)));
  } else {
    yourResponseDetailsSection.summaryList.rows.push(...[
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(claim.partialAdmission.howMuchHaveYouPaid?.amount)), yourResponseDetailsHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', { lng: getLng(lang) }), formatDateToFullDate(claim.partialAdmission.howMuchHaveYouPaid?.date), '', changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUT_CLAIMED', { lng: getLng(lang) }), claim.partialAdmission.howMuchHaveYouPaid?.text, '', changeLabel(lang)),
    ]);
  }

  yourResponseDetailsSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }), claim.partialAdmission.whyDoYouDisagree?.text, yourReasonsToDisagreeHref, changeLabel(lang)),
  ]);
};

const getSummaryRowsForFullReject = (claim: Claim, claimId: string, lang: string | unknown, yourResponseDetailsSection: SummarySection) => {
  const howMuchHaveYouPaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FR_AMOUNT_YOU_PAID_URL);
  const whyDoYouDisagreeUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL);

  yourResponseDetailsSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_HAVE_YOU_PAID', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(claim.rejectAllOfClaim.howMuchHaveYouPaid.amount)), howMuchHaveYouPaidUrl, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', { lng: getLng(lang) }), formatDateToFullDate(claim.rejectAllOfClaim.howMuchHaveYouPaid.date), howMuchHaveYouPaidUrl, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_DID_YOU_PAY_THIS_AMOUNT', { lng: getLng(lang) }), claim.rejectAllOfClaim.howMuchHaveYouPaid.text, howMuchHaveYouPaidUrl, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', { lng: getLng(lang) }), claim.rejectAllOfClaim.whyDoYouDisagree.text, whyDoYouDisagreeUrl, changeLabel(lang)),
  ]);
};

export const buildYourResponseDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let yourResponseDetailsSection: SummarySection = null;

  yourResponseDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  switch(claim.respondent1.responseType) {
    case ResponseType.PART_ADMISSION:
      getSummaryRowsForPartAdmission(claim,claimId,lang,yourResponseDetailsSection);
      break;
    case ResponseType.FULL_DEFENCE:
      getSummaryRowsForFullReject(claim,claimId,lang,yourResponseDetailsSection);
      break;
  }

  addTimeline(claim, claimId, lang, yourResponseDetailsSection);
  addEvidence(claim, claimId, lang, yourResponseDetailsSection);

  return yourResponseDetailsSection;
};
