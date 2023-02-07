import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
  DQ_SENT_EXPERT_REPORTS_URL,
  DQ_SHARE_AN_EXPERT_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
} from 'routes/urls';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {YesNo} from 'form/models/yesNo';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';

const getEmptyStringIfUndefined = (value: string): string => value || '';

const getWitnesses = (claim: Claim, claimId: string, lang: string): SummaryRow [] => {
  const witnessesHref = constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL);
  const otherWitnesses = claim.directionQuestionnaire?.witnesses?.otherWitnesses?.option;
  const summaryRows: SummaryRow [] = [];

  summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES', {lng: getLng(lang)}), otherWitnesses, witnessesHref, changeLabel(lang)));

  if(otherWitnesses === YesNo.YES)
  {
    const witnesses: OtherWitnessItems[] = claim.directionQuestionnaire.witnesses?.otherWitnesses?.witnessItems;
    witnesses.forEach((witness, index) => {
      summaryRows.push(summaryRow(`${t('PAGES.CHECK_YOUR_ANSWER.WITNESS', {lng: getLng(lang)})} ${index + 1}`, '', witnessesHref, changeLabel(lang)));
      summaryRows.push(summaryRow(t('COMMON.INPUT_LABELS.FIRST_NAME', {lng: getLng(lang)}), getEmptyStringIfUndefined(witness.firstName)));
      summaryRows.push(summaryRow(t('COMMON.INPUT_LABELS.LAST_NAME', {lng: getLng(lang)}), getEmptyStringIfUndefined(witness.lastName)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS', {lng: getLng(lang)}), getEmptyStringIfUndefined(witness.email)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER', {lng: getLng(lang)}), getEmptyStringIfUndefined(witness.telephone)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY', {lng: getLng(lang)}), getEmptyStringIfUndefined(witness.details)));
    });
  }

  return summaryRows;
};

export const buildHearingRequirementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const hearingRequirementSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  if (claim.isFastTrackClaim && claim.directionQuestionnaire?.hearing != null) {
    const considerClaimantDoc = claim.directionQuestionnaire?.hearing?.considerClaimantDocuments;
    const triedToSettle = claim.directionQuestionnaire?.hearing?.triedToSettle?.option;
    const requestExtra4Weeks = claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option;

    hearingRequirementSection.summaryList.rows.push(...[
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE', {lng: getLng(lang)}), triedToSettle, constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL), changeLabel(getLng(lang))),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS', {lng: getLng(lang)}), requestExtra4Weeks, constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL), changeLabel(getLng(lang))),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT', {lng: getLng(lang)}), considerClaimantDoc?.option, constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL), changeLabel(getLng(lang))),
    ]);

    if (considerClaimantDoc?.option === YesNo.YES)
      hearingRequirementSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS', {lng: getLng(lang)}), getEmptyStringIfUndefined(considerClaimantDoc?.details)));

  } else {
    //TODO : add small claim related row's
  }

  //TODO: add common rows here
  // TODO Witnesses: Reference 32
  hearingRequirementSection.summaryList.rows.push(...getWitnesses(claim, claimId, getLng(lang)));
  const hasReportSend = claim.directionQuestionnaire?.experts?.expertReportDetails?.option || '';
  const wantUseExpectEvidence = '';
  const shareExpert = '';
  const giveEvidence = '';

  hearingRequirementSection.summaryList.rows.push(...[
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_USE_EXPERT_EVIDENCE', {lng: getLng(lang)}), t(`${wantUseExpectEvidence}`, {lng: getLng(lang)}), constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL ), changeLabel(getLng(lang))),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.HAVE_YOU_ALREADY_SENT_EXPERT_REPORTS_TO_OTHER_PARTIES', {lng: getLng(lang)}), t(`${hasReportSend}`, {lng: getLng(lang)}), constructResponseUrlWithIdParams(claimId, DQ_SENT_EXPERT_REPORTS_URL ), changeLabel(getLng(lang))),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_SHARE_AN_EXPERT_WITH_CLAIMANT', {lng: getLng(lang)}), t(`${shareExpert}`, {lng: getLng(lang)}), constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL ), changeLabel(getLng(lang))),
    // TODO:Witnesses: Reference 32
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_GIVE_EVIDENCE_YOURSELF', {lng: getLng(lang)}), t(`${giveEvidence}`, {lng: getLng(lang)}), constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL ), changeLabel(getLng(lang)))]);

  return hearingRequirementSection;
};
