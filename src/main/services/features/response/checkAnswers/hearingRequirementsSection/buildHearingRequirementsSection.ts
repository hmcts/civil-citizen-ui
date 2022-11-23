import {Claim} from 'common/models/claim';
import {summarySection, SummarySection} from 'common/models/summaryList/summarySections';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'common/models/summaryList/summaryList';
import {
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_WELSH_LANGUAGE_URL,
  VULNERABILITY_URL,
} from '../../../../../routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {addSupportRequiredList} from './addSupportRequiredList';

const determinationWithoutHearingQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const determinationWithoutHearingQuestion = t('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARING', {lng})
    + t('PAGES.DETERMINATION_WITHOUT_HEARING.IE', {lng});
  const determinationWithoutHearingOption = claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option;
  return summaryRow(
    determinationWithoutHearingQuestion,
    determinationWithoutHearingOption === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

const determinationWithoutHearingReason = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const reason = claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing
    ? claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing
    : '';
  return summaryRow(
    t('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY', {lng}),
    reason,
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

const speakingLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {
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
    constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL),
    changeLabel(lng),
  );
};

const documentsLanguagePreference = (claim: Claim, claimId: string, lng: string): SummaryRow => {
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
    constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL),
    changeLabel(lng),
  );
};

const giveEvidenceYourself = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim?.directionQuestionnaire?.defendantYourselfEvidence?.option === YesNo.YES
    ? YesNoUpperCamelCase.YES
    : YesNoUpperCamelCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE', {lng}),
    option,
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
    changeLabel(lng),
  );
};

const vulnerabilityQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES
    ? YesNoUpperCamelCase.YES
    : YesNoUpperCamelCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION', {lng}),
    option,
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

const vulnerabilityInfo = (claim: Claim, claimId: string, lng: string): SummaryRow => {
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

const buildHearingRequirementsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const hearingRequirementsSection = summarySection({
    title: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.TITLE', {lng}),
    summaryRows: [],
  });

  hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingQuestion(claim, claimId, lng));

  if (claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option === YesNo.NO) {
    hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingReason(claim, claimId, lng));
  }

  if (claim?.directionQuestionnaire?.defendantYourselfEvidence?.option) {
    hearingRequirementsSection.summaryList.rows.push(giveEvidenceYourself(claim, claimId, lng));
  }

  if (claim?.directionQuestionnaire?.vulnerabilityQuestions?.vulnerability) {
    hearingRequirementsSection.summaryList.rows.push(vulnerabilityQuestion(claim, claimId, lng));
    hearingRequirementsSection.summaryList.rows.push(vulnerabilityInfo(claim, claimId, lng));
  }

  if (claim?.hasSupportRequiredList) {
    addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
  }

  if (claim?.directionQuestionnaire?.welshLanguageRequirements?.language) {
    hearingRequirementsSection.summaryList.rows.push(speakingLanguagePreference(claim, claimId, lng));
    hearingRequirementsSection.summaryList.rows.push(documentsLanguagePreference(claim, claimId, lng));
  }

  return hearingRequirementsSection;
};

export {
  buildHearingRequirementsSection,
  determinationWithoutHearingReason,
  determinationWithoutHearingQuestion,
  documentsLanguagePreference,
  giveEvidenceYourself,
  speakingLanguagePreference,
  vulnerabilityInfo,
  vulnerabilityQuestion,
};
