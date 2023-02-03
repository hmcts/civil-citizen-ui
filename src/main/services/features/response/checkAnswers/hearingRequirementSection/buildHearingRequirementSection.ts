import {summarySection, SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {SummaryRow, summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
} from '../../../../../routes/urls';
import {OtherWitnessItems} from '../../../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {YesNo} from '../../../../../common/form/models/yesNo';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

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

export const buildHearingRequirementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection =>{
  const hearingRequirementSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  if (claim.isFastTrackClaim) {
    const considerClaimantDoc = claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option;
    hearingRequirementSection.summaryList.rows.push(...[
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE', {lng: getLng(lang)}), claim.directionQuestionnaire?.hearing?.triedToSettle?.option, constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL), changeLabel(getLng(lang))),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS', {lng: getLng(lang)}), claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option, constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL), changeLabel(getLng(lang))),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT', {lng: getLng(lang)}), considerClaimantDoc, constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL), changeLabel(getLng(lang))),
    ]);

    if (considerClaimantDoc === YesNo.YES)
      hearingRequirementSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS', {lng: getLng(lang)}), getEmptyStringIfUndefined(claim?.directionQuestionnaire?.hearing?.considerClaimantDocuments?.details)));

  } else {
    //TODO : add small claim related row's
  }

  //TODO: add common rows here
  hearingRequirementSection.summaryList.rows.push(...getWitnesses(claim, claimId, getLng(lang)));

  return hearingRequirementSection;
};
