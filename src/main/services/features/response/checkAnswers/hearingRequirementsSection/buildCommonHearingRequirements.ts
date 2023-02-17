import {getLng} from 'common/utils/languageToggleUtils';
import {
  addSupportRequiredList,
} from 'services/features/response/checkAnswers/hearingRequirementsSection/addSupportRequiredList';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL, DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_WELSH_LANGUAGE_URL,
  VULNERABILITY_URL,
} from 'routes/urls';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {getAffirmation, getEmptyStringIfUndefined} from 'common/utils/checkYourAnswer/getEmptyStringIfUndefined';

export const getWitnesses = (claim: Claim, claimId: string, lang: string): SummaryRow[]  => {
  const witnessesHref = constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL);
  const otherWitnesses = getAffirmation(claim?.directionQuestionnaire?.witnesses?.otherWitnesses?.option);
  const summaryRows: SummaryRow [] = [];

  summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES', {lng: getLng(lang)}), t(otherWitnesses, {lang}), witnessesHref, changeLabel(lang)));

  if(claim?.directionQuestionnaire?.witnesses?.otherWitnesses?.option === YesNo.YES)
  {
    const witnesses: OtherWitnessItems[] = claim?.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems;
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

export const vulnerabilityQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = getAffirmation(claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option);

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION', {lng}),
    t(option, {lng}),
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

export const vulnerabilityInfo = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.vulnerabilityDetails
    ? claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.vulnerabilityDetails
    : '';

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO', {lng}),
    details,
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

export const giveEvidenceYourself = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = getAffirmation(claim?.directionQuestionnaire?.defendantYourselfEvidence?.option );

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE', {lng}),
    t(option, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
    changeLabel(lng),
  );
};

export const speakingLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  let speakingLanguageName;

  switch (claim?.directionQuestionnaire?.welshLanguageRequirements?.language?.speakLanguage) {
    case LanguageOptions.ENGLISH:
      speakingLanguageName = t('PAGES.WELSH_LANGUAGE.ENGLISH', {lng});
      break;
    case LanguageOptions.WELSH:
      speakingLanguageName = t('PAGES.WELSH_LANGUAGE.WELSH', {lng});
      break;
    case LanguageOptions.WELSH_AND_ENGLISH:
      speakingLanguageName = t('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH', {lng});
      break;
    default:
      speakingLanguageName = '';
      break;
  }

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK', {lng}),
    speakingLanguageName,
  );
};

export const documentsLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  let documentsLanguageName;

  switch (claim?.directionQuestionnaire?.welshLanguageRequirements?.language?.documentsLanguage) {
    case LanguageOptions.ENGLISH:
      documentsLanguageName = t('PAGES.WELSH_LANGUAGE.ENGLISH', {lng});
      break;
    case LanguageOptions.WELSH:
      documentsLanguageName = t('PAGES.WELSH_LANGUAGE.WELSH', {lng});
      break;
    case LanguageOptions.WELSH_AND_ENGLISH:
      documentsLanguageName = t('PAGES.WELSH_LANGUAGE.WELSH_AND_ENGLISH', {lng});
      break;
    default:
      documentsLanguageName = '';
      break;
  }

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS', {lng}),
    documentsLanguageName,
  );
};

export const phoneAndVideoQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option =  getAffirmation(claim?.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option);

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING', {lng}),
    t(option, lng),
    constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL),
    changeLabel(lng),
  );
};

export const phoneAndVideoInfo = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim?.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details
    ? claim?.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details
    : '';

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const buildCommonHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {

  if (claim?.directionQuestionnaire?.defendantYourselfEvidence?.option) {
    hearingRequirementsSection.summaryList.rows.push(giveEvidenceYourself(claim, claimId, lng));
  }

  hearingRequirementsSection.summaryList.rows.push(...getWitnesses(claim, claimId, getLng(lng)));

  if (claim?.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option) {
    hearingRequirementsSection.summaryList.rows.push(phoneAndVideoQuestion(claim, claimId, getLng(lng)));

    if(claim?.directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(phoneAndVideoInfo(claim, claimId, getLng(lng)));
  }

  if (claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability) {
    hearingRequirementsSection.summaryList.rows.push(vulnerabilityQuestion(claim, claimId, lng));

    if(claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(vulnerabilityInfo(claim, claimId, lng));
  }

  if (claim?.hasSupportRequiredList) {
    addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
  }

  if (claim?.directionQuestionnaire?.welshLanguageRequirements?.language) {
    hearingRequirementsSection.summaryList.rows.push(summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE', {lng}),null ,constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL), changeLabel(lng)));
    hearingRequirementsSection.summaryList.rows.push(speakingLanguagePreference(claim, claimId, lng));
    hearingRequirementsSection.summaryList.rows.push(documentsLanguagePreference(claim, claimId, lng));
  }

};
