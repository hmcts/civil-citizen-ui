import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_DEFENDANT_WITNESSES_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_WELSH_LANGUAGE_URL,
  VULNERABILITY_URL,
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_COURT_LOCATION_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
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
  getNumberOfUnavailableDays,
  getListOfUnavailableDate,
} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
import {addSupportRequiredList} from 'services/features/claimantResponse/checkAnswers/hearing/addSupportRequiredList';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';

const MAX_UNAVAILABLE_DAYS_FOR_HEARING_WITHOUT_REASON = 30;

export const getWitnesses = ( directionQuestionnaire : DirectionQuestionnaire, claimId: string, lng: string): SummaryRow[]  => {
  const witnessesHref = constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL);
  const otherWitnesses = directionQuestionnaire?.witnesses?.otherWitnesses?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const summaryRows: SummaryRow [] = [];

  summaryRows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES', {lng}),  t(`COMMON.${otherWitnesses}`, {lng}), witnessesHref, changeLabel(lng)));

  if(otherWitnesses === YesNoUpperCase.YES){
    const witnesses: OtherWitnessItems[] = directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems;
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

export const getSummaryRowForDisplayEvidenceYourself = ( directionQuestionnaire : DirectionQuestionnaire, claimId: string, lng: string): SummaryRow => {
  const giveEvidenceYourselfAnswer = getFormattedAnswerForYesNoNotReceived(directionQuestionnaire?.defendantYourselfEvidence?.option, lng);

  return summaryRow(
    t('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE', {lng}),
    giveEvidenceYourselfAnswer,
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
    changeLabel(lng),
  );
};

export const vulnerabilityQuestion = ( directionQuestionnaire : DirectionQuestionnaire, claimId: string, lng: string): SummaryRow => {
  const option = directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_QUESTION', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

export const vulnerabilityInfo = ( directionQuestionnaire : DirectionQuestionnaire, claimId: string, lng: string): SummaryRow => {
  const details = directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.vulnerabilityDetails;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.VULNERABILITY_INFO', {lng}),
    getEmptyStringIfUndefined(details),
    constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL),
    changeLabel(lng),
  );
};

export const giveEvidenceYourself = (directionQuestionnaire : DirectionQuestionnaire, claimId: string, lng: string): SummaryRow => {
  const option = directionQuestionnaire?.defendantYourselfEvidence?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_EVIDENCE', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
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

export const speakingLanguagePreference = (lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const speakingLanguageName = getLanguageSelected(directionQuestionnaire?.welshLanguageRequirements?.language?.speakLanguage, lng);

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_SPEAK', {lng}),
    speakingLanguageName,
  );
};

export const documentsLanguagePreference = ( lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {

  const documentsLanguageName = getLanguageSelected(directionQuestionnaire?.welshLanguageRequirements?.language?.documentsLanguage, lng);

  return summaryRow(
    t('PAGES.WELSH_LANGUAGE.WHAT_LANGUAGE_DOCUMENTS', {lng}),
    documentsLanguageName,
  );
};

export const phoneAndVideoQuestion = ( claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option =  directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_PHONE_OR_VIDEO_HEARING', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL),
    changeLabel(lng),
  );
};

export const phoneAndVideoInfo = ( lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const details = directionQuestionnaire?.hearing?.phoneOrVideoHearing?.details;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY_DO_YOU_WANT_PHONE_VIDEO_HEARING', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const getUnavailableDatesList = ( claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const hasUnavailableDatesForHearing = getListOfUnavailableDate(directionQuestionnaire?.hearing?.unavailableDatesForHearing, lng);
  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES', {lng}),
    ` ${[...hasUnavailableDatesForHearing].join('<br>')}`,
    constructResponseUrlWithIdParams(claimId, DQ_AVAILABILITY_DATES_FOR_HEARING_URL),
    changeLabel(lng),
  );
};

export const getUnavailabilityReason = ( claimId: string, days: number, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const whyUnavailableForHearing = directionQuestionnaire.hearing.whyUnavailableForHearing?.reason;
  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS', {days: days, lng: lng}),
    whyUnavailableForHearing,
    constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
    changeLabel(lng),
  );
};

export const displayUnavailabilityForHearing = ( claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const hasUnavailableDatesForHearing = getFormattedAnswerForYesNoNotReceived(directionQuestionnaire?.hearing?.cantAttendHearingInNext12Months?.option, lng);
  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE', {lng}),
    hasUnavailableDatesForHearing,
    constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
    changeLabel(lng),
  );
};

export const getSpecificCourtLocation = ( claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const hasSpecificCourtLocation = getFormattedAnswerForYesNoNotReceived(directionQuestionnaire?.hearing?.specificCourtLocation?.option, lng);
  return summaryRow(
    t('PAGES.SPECIFIC_COURT.TITLE', {lng}),
    hasSpecificCourtLocation,
    constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL),
    changeLabel(lng),
  );
};

export const displaySpecificCourtLocation = ( claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const hasSpecificCourtLocation = directionQuestionnaire?.hearing?.specificCourtLocation?.courtLocation;
  return summaryRow(
    t('PAGES.SPECIFIC_COURT.SELECTED_COURT', {lng}),
    hasSpecificCourtLocation,
    constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL),
    changeLabel(lng),
  );
};

export const getSpecificCourtLocationReason = (claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const whySpecificCourtLocation = directionQuestionnaire?.hearing?.specificCourtLocation?.reason;
  return summaryRow(
    t('PAGES.SPECIFIC_COURT.REASON', {lng}),
    whySpecificCourtLocation,
    constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL),
    changeLabel(lng),
  );
};

export const buildCommonHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire) => {

  if (directionQuestionnaire?.defendantYourselfEvidence?.option) {
    hearingRequirementsSection.summaryList.rows.push(getSummaryRowForDisplayEvidenceYourself(directionQuestionnaire, claimId, lng));
  }
  hearingRequirementsSection.summaryList.rows.push(...getWitnesses(directionQuestionnaire, claimId, lng));

  hearingRequirementsSection.summaryList.rows.push(displayUnavailabilityForHearing(claimId, lng,directionQuestionnaire));

  if (directionQuestionnaire?.hearing?.cantAttendHearingInNext12Months?.option === YesNo.YES) {
    hearingRequirementsSection.summaryList.rows.push(getUnavailableDatesList( claimId, lng,directionQuestionnaire));
    const numberOfUnavailableDays = getNumberOfUnavailableDays(directionQuestionnaire.hearing.unavailableDatesForHearing);
    if (numberOfUnavailableDays > MAX_UNAVAILABLE_DAYS_FOR_HEARING_WITHOUT_REASON) {
      hearingRequirementsSection.summaryList.rows.push(getUnavailabilityReason( claimId, numberOfUnavailableDays, lng,directionQuestionnaire));
    }
  }

  if (directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option) {
    hearingRequirementsSection.summaryList.rows.push(phoneAndVideoQuestion( claimId, lng,directionQuestionnaire));

    if(directionQuestionnaire?.hearing?.phoneOrVideoHearing?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(phoneAndVideoInfo( lng,directionQuestionnaire));
  }

  if (directionQuestionnaire?.vulnerabilityQuestions?.vulnerability) {
    hearingRequirementsSection.summaryList.rows.push(vulnerabilityQuestion(directionQuestionnaire, claimId, lng));

    if(directionQuestionnaire?.vulnerabilityQuestions?.vulnerability?.option === YesNo.YES)
      hearingRequirementsSection.summaryList.rows.push(vulnerabilityInfo(directionQuestionnaire, claimId, lng));
  }

  if (claim.hasSupportRequiredList) {
    addSupportRequiredList(claim, hearingRequirementsSection, claimId, lng);
  }

  hearingRequirementsSection.summaryList.rows.push(getSpecificCourtLocation( claimId, lng,directionQuestionnaire));
  if (directionQuestionnaire?.hearing?.specificCourtLocation?.option === YesNo.YES) {
    hearingRequirementsSection.summaryList.rows.push(displaySpecificCourtLocation(claimId, lng,directionQuestionnaire));
    hearingRequirementsSection.summaryList.rows.push(getSpecificCourtLocationReason( claimId, lng,directionQuestionnaire));
  }

  if (directionQuestionnaire?.welshLanguageRequirements?.language) {
    hearingRequirementsSection.summaryList.rows.push(summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.WELSH_LANGUAGE', {lng}),null ,constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL), changeLabel(lng)));
    hearingRequirementsSection.summaryList.rows.push(speakingLanguagePreference( lng,directionQuestionnaire));
    hearingRequirementsSection.summaryList.rows.push(documentsLanguagePreference( lng,directionQuestionnaire));
  }

};
