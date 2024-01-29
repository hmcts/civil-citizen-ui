import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
  CITIZEN_EVIDENCE_URL,
  CITIZEN_FR_AMOUNT_YOU_PAID_URL,
  CITIZEN_OWED_AMOUNT_URL,
  CITIZEN_TIMELINE_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL,
  CITIZEN_WHY_DO_YOU_DISAGREE_URL,
  RESPONSE_YOUR_DEFENCE_URL,
} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {YesNo} from 'form/models/yesNo';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {convertToEvidenceTypeToTranslationKey} from 'common/models/evidence/evidenceType';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const addTimeline = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourTimelineHref = constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL);
  const timeline = claim.partialAdmission?.timeline ? claim.partialAdmission.timeline : new DefendantTimeline([], '');

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_TITLE', {lng: getLng(lang)}), '', yourTimelineHref, changeLabel(lang)),
  );

  for (const item of timeline.rows) {
    const timelineDate = formatDateToFullDate(new Date(item.date));
    section.summaryList.rows.push(
      summaryRow(timelineDate.toString(), item.description, yourTimelineHref, changeLabel(lang)),
    );
  }

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TIMELINE_COMMENTS', {lng: getLng(lang)}), timeline.comment, yourTimelineHref, changeLabel(lang)),
  );
};

const addEvidence = (claim: Claim, claimId: string, lang: string | unknown, section: SummarySection) => {
  const yourEvidenceHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL);
  const evidenceItem = claim.evidence?.evidenceItem;
  const lng = getLng(lang);

  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE', {lng}), '', yourEvidenceHref, changeLabel(lang)),
  );
  if (evidenceItem) {
    for (const item of evidenceItem) {
      const itemType = t(convertToEvidenceTypeToTranslationKey(item.type), {lng});
      section.summaryList.rows.push(
        summaryRow(itemType, item.description, yourEvidenceHref, changeLabel(lang)),
      );
    }
  }
  section.summaryList.rows.push(
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_COMMENTS', {lng}), claim.evidence?.comment, yourEvidenceHref, changeLabel(lang)),
  );
};
const isPaidAmountEqulGreaterThanTotalAmount = (claim: Claim) => {
  const amount = claim.rejectAllOfClaim.howMuchHaveYouPaid?.amount ? claim.rejectAllOfClaim.howMuchHaveYouPaid.amount : 0;
  const totalClaimAmount = claim.totalClaimAmount ? claim.totalClaimAmount : 0;
  return (amount < totalClaimAmount);
};

const getSummaryRowsForPartAdmission = (claim: Claim, claimId: string, lang: string | unknown, yourResponseDetailsSection: SummarySection) => {
  const yourResponseDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_AMOUNT_YOU_PAID_URL);
  const yourReasonsToDisagreeHref = constructResponseUrlWithIdParams(claimId, CITIZEN_WHY_DO_YOU_DISAGREE_URL);
  const howMuchYouAdmitYouOweHref = constructResponseUrlWithIdParams(claimId, CITIZEN_OWED_AMOUNT_URL);
  const howMuchDoYouOweAmount = claim.partialAdmission.howMuchDoYouOwe?.amount ? claim.partialAdmission.howMuchDoYouOwe.amount.toFixed(2) : undefined;

  if (claim.partialAdmission.alreadyPaid?.option === YesNo.NO) {
    yourResponseDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_YOU_ADMIT_YOU_OWE', {lng: getLng(lang)}), currencyFormatWithNoTrailingZeros(Number(howMuchDoYouOweAmount)), howMuchYouAdmitYouOweHref, changeLabel(lang)));
  } else {
    yourResponseDetailsSection.summaryList.rows.push(...[
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID', {lng: getLng(lang)}), currencyFormatWithNoTrailingZeros(Number(claim.partialAdmission.howMuchHaveYouPaid?.amount)), yourResponseDetailsHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', {lng: getLng(lang)}), formatDateToFullDate(claim.partialAdmission.howMuchHaveYouPaid?.date, getLng(lang)), '', changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUNT_CLAIMED', {lng: getLng(lang)}), claim.partialAdmission.howMuchHaveYouPaid?.text, '', changeLabel(lang)),
    ]);
  }

  yourResponseDetailsSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', {lng: getLng(lang)}), claim.partialAdmission.whyDoYouDisagree?.text, yourReasonsToDisagreeHref, changeLabel(lang)),
  ]);
};

const getSummaryRowsForFullReject = (claim: Claim, claimId: string, lang: string | unknown, yourResponseDetailsSection: SummarySection) => {
  const howMuchHaveYouPaidUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_FR_AMOUNT_YOU_PAID_URL);
  const rejectUrl = claim.rejectAllOfClaim.option == RejectAllOfClaimType.DISPUTE ? RESPONSE_YOUR_DEFENCE_URL : CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL;
  const whyDoYouDisagreeUrl = constructResponseUrlWithIdParams(claimId, rejectUrl);
  const disagreeText = claim.rejectAllOfClaim.whyDoYouDisagree?.text ? claim.rejectAllOfClaim.whyDoYouDisagree.text : claim.rejectAllOfClaim.defence?.text;
  if (claim.rejectAllOfClaim.option !== RejectAllOfClaimType.DISPUTE) {
    yourResponseDetailsSection.summaryList.rows.push(...[
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_MUCH_HAVE_YOU_PAID', {lng: getLng(lang)}), currencyFormatWithNoTrailingZeros(Number(claim.rejectAllOfClaim.howMuchHaveYouPaid.amount)), howMuchHaveYouPaidUrl, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY', {lng: getLng(lang)}), formatDateToFullDate(claim.rejectAllOfClaim.howMuchHaveYouPaid.date, getLng(lang)), howMuchHaveYouPaidUrl, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_HOW_DID_YOU_PAY_THIS_AMOUNT', {lng: getLng(lang)}), claim.rejectAllOfClaim.howMuchHaveYouPaid.text, howMuchHaveYouPaidUrl, changeLabel(lang)),
    ]);
  }
  if (isPaidAmountEqulGreaterThanTotalAmount(claim)) yourResponseDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE', {lng: getLng(lang)}), disagreeText, whyDoYouDisagreeUrl, changeLabel(lang)));
};

export const buildYourResponseDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let yourResponseDetailsSection: SummarySection = null;

  yourResponseDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  switch (claim.respondent1.responseType) {
    case ResponseType.PART_ADMISSION:
      getSummaryRowsForPartAdmission(claim, claimId, lang, yourResponseDetailsSection);
      addTimeline(claim, claimId, lang, yourResponseDetailsSection);
      addEvidence(claim, claimId, lang, yourResponseDetailsSection);
      break;
    case ResponseType.FULL_DEFENCE:
      getSummaryRowsForFullReject(claim, claimId, lang, yourResponseDetailsSection);
      if (isPaidAmountEqulGreaterThanTotalAmount(claim)) {
        addTimeline(claim, claimId, lang, yourResponseDetailsSection);
        addEvidence(claim, claimId, lang, yourResponseDetailsSection);
      }
      break;
  }

  return yourResponseDetailsSection;
};
