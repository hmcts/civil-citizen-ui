import {
  addSupportRequiredList,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/addSupportRequiredList';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_DEFENDANT_WITNESSES_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_WELSH_LANGUAGE_URL,
  VULNERABILITY_URL,
} from 'routes/urls';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {t} from 'i18next';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {
  getEmptyStringIfUndefined,
  getFormattedAnswerForYesNoNotReceived,
} from 'common/utils/checkYourAnswer/formatAnswer';
import {
  buildExpertReportSection
} from 'services/features/response/checkAnswers/hearingRequirementsSection/hearingExportsReportBuilderSection';

export const getWitnesses = (claim: Claim, claimId: string, lng: string): SummaryRow[]  => {
  const witnessesHref = constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL);
  const otherWitnesses = claim.directionQuestionnaire?.witnesses?.otherWitnesses?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const summaryRows: SummaryRow [] = [];

  summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES', {lng}),  t(`COMMON.${otherWitnesses}`, {lng}), witnessesHref, changeLabel(lng)));

  if(otherWitnesses === YesNoUpperCase.YES)
  {
    const witnesses: OtherWitnessItems[] = claim?.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems;
    witnesses.forEach((witness, index) => {
      summaryRows.push(summaryRow(`${t('PAGES.CHECK_YOUR_ANSWER.WITNESS', {lng})} ${index + 1}`, '', witnessesHref, changeLabel(lng)));
      summaryRows.push(summaryRow(t('COMMON.INPUT_LABELS.FIRST_NAME', {lng}), getEmptyStringIfUndefined(witness.firstName)));
      summaryRows.push(summaryRow(t('COMMON.INPUT_LABELS.LAST_NAME', {lng}), getEmptyStringIfUndefined(witness.lastName)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS', {lng}), getEmptyStringIfUndefined(witness.email)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER', {lng}), getEmptyStringIfUndefined(witness.telephone)));
      summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY', {lng}), getEmptyStringIfUndefined(witness.details)));
    });
  }

  return summaryRows;
};

export const getSummaryRowForDisplayEvidenceYourself = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const giveEvidenceYourselfAnswer = getFormattedAnswerForYesNoNotReceived(claim.directionQuestionnaire?.defendantYourselfEvidence?.option, lng);

  return summaryRow(
    t('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE', {lng}),
    giveEvidenceYourselfAnswer,
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
    changeLabel(lng),
  );
};

export const vulnerabilityQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

export const vulnerabilityInfo = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.vulnerabilityDetails;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO', {lng}),
    getEmptyStringIfUndefined(details),
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

function getLanguageSelected(languageOptions: LanguageOptions, lng: string) {
  switch (languageOptions) {
    case LanguageOptions.ENGLISH:
      return t('PAGES.WELSH_LANGUAGE.ENGLISH', {lng});
    case LanguageOptions.WELSH:
      return t('PAGES.WELSH_LANGUAGE.WELSH', {lng});
    case LanguageOptions.WELSH_AND_ENGLISH:
      return t('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH', {lng});
    default:
      return '';
  }
}

export const speakingLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const speakingLanguageName = getLanguageSelected(claim.directionQuestionnaire?.welshLanguageRequirements?.language?.speakLanguage, lng);

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK', {lng}),
    speakingLanguageName,
  );
};

export const documentsLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {

  const documentsLanguageName = getLanguageSelected(claim.directionQuestionnaire?.welshLanguageRequirements?.language?.documentsLanguage, lng);

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS', {lng}),
    documentsLanguageName,
  );
};

export const phoneAndVideoQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option =  claim.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL),
    changeLabel(lng),
  );
};

export const phoneAndVideoInfo = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const buildCommonHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {
  if (claim.directionQuestionnaire?.defendantYourselfEvidence?.option) {
    hearingRequirementsSection.summaryList.rows.push(getSummaryRowForDisplayEvidenceYourself(claim, claimId, lng));
  }
  hearingRequirementsSection.summaryList.rows.push(...getWitnesses(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option) {
    hearingRequirementsSection.summaryList.rows.push(phoneAndVideoQuestion(claim, claimId, lng));

    if(claim.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(phoneAndVideoInfo(claim, claimId, lng));
  }

  if (claim.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability) {
    hearingRequirementsSection.summaryList.rows.push(vulnerabilityQuestion(claim, claimId, lng));

    if(claim.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(vulnerabilityInfo(claim, claimId, lng));
  }

  if (claim.hasSupportRequiredList) {
    addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
  }

  hearingRequirementsSection.summaryList.rows.push(... buildExpertReportSection(claim, claimId, lng));
  if (claim.directionQuestionnaire?.welshLanguageRequirements?.language) {
    hearingRequirementsSection.summaryList.rows.push(summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE', {lng}),null ,constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL), changeLabel(lng)));
    hearingRequirementsSection.summaryList.rows.push(speakingLanguagePreference(claim, claimId, lng));
    hearingRequirementsSection.summaryList.rows.push(documentsLanguagePreference(claim, claimId, lng));
  }

};
