import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  DQ_COURT_LOCATION_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {getFormattedUserAnswer, getEmptyStringIfUndefined} from 'common/utils/checkYourAnswer/getEmptyStringIfUndefined';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getListOfUnavailableDate,
  getNumberOfUnavailableDays,
} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';

export const triedToSettleQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.hearing?.triedToSettle?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL),
    changeLabel(lng),
  );
};

export const requestExtra4WeeksQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocResponse = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.details;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const getDisplayWantGiveSelfEvidence = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const shouldConsiderGiveYourselfEvidence = getFormattedUserAnswer(claim.directionQuestionnaire?.defendantYourselfEvidence?.option, lng);

  return summaryRow(
    t('PAGES.DEFENDANT_YOURSELF_EVIDENCE.TITLE', {lng}),
    shouldConsiderGiveYourselfEvidence,
    constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL),
    changeLabel(lng),
  );
};

export const buildFastTrackHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {

  if (claim.directionQuestionnaire?.hearing?.triedToSettle?.option)
    hearingRequirementsSection.summaryList.rows.push(triedToSettleQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option)
    hearingRequirementsSection.summaryList.rows.push(requestExtra4WeeksQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option)
    hearingRequirementsSection.summaryList.rows.push(considerClaimantDocQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option == YesNo.YES)
    hearingRequirementsSection.summaryList.rows.push(considerClaimantDocResponse(claim, claimId, lng));

  if (claim.directionQuestionnaire?.defendantYourselfEvidence?.option)
    hearingRequirementsSection.summaryList.rows.push(getDisplayWantGiveSelfEvidence(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.specificCourtLocation?.option)
    hearingRequirementsSection.summaryList.rows.push(getSpecificCourtLocation(claim, claimId, getLng(lng)));

  if (claim.directionQuestionnaire?.hearing?.cantAttendHearingInNext12Months?.option)
    hearingRequirementsSection.summaryList.rows.push(displayDefendantUnavailableDate(claim, claimId, getLng(lng)));

  if (claim.directionQuestionnaire?.hearing?.cantAttendHearingInNext12Months?.option === YesNo.YES){
    hearingRequirementsSection.summaryList.rows.push(getDefendantUnavailableDate(claim, claimId, getLng(lng)));
    hearingRequirementsSection.summaryList.rows.push(getUnavailableHearingDays(claim, claimId, getLng(lng)));
  }
};

export const getDefendantUnavailableDate = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const hasUnavailableDatesForHearing = getListOfUnavailableDate(claim.directionQuestionnaire?.hearing?.unavailableDatesForHearing);

  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.UNAVAILABLE_DATES', {lng}),
    ` ${[...hasUnavailableDatesForHearing].join('<br>')}`,
    constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
    changeLabel(lng),
  );
};

export const getUnavailableHearingDays = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const NUMBER_OF_DAYS = 30;
  const whyUnavailableForHearing = claim.directionQuestionnaire.hearing.whyUnavailableForHearing?.reason;
  const days = getNumberOfUnavailableDays(claim.directionQuestionnaire.hearing.unavailableDatesForHearing);

  if (days <= NUMBER_OF_DAYS){
    return;
  }

  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.WHY_UNAVAILABLE_FOR_MORE_THAN_30_DAYS', {days:days, lng:lng}),
    whyUnavailableForHearing,
    constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
    changeLabel(lng),
  );
};

export const displayDefendantUnavailableDate = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const hasUnavailableDatesForHearing = getFormattedUserAnswer(claim.directionQuestionnaire?.hearing?.cantAttendHearingInNext12Months?.option, lng);

  return summaryRow(
    t('PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE', {lng}),
    hasUnavailableDatesForHearing,
    constructResponseUrlWithIdParams(claimId, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL),
    changeLabel(lng),
  );
};

export const getSpecificCourtLocation = (claim: Claim, claimId: string, lng:string): SummaryRow=> {
  const hasSpecificCourtLocation = getFormattedUserAnswer(claim.directionQuestionnaire?.hearing?.specificCourtLocation?.option, lng);

  return summaryRow(
    t('PAGES.SPECIFIC_COURT.TITLE', {lng}),
    hasSpecificCourtLocation,
    constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL),
    changeLabel(lng),
  );
};

export const displaySpecificCourtLocation = (claim: Claim, claimId: string, lng:string): SummaryRow=> {
  const hasSpecificCourtLocation = claim.directionQuestionnaire?.hearing?.specificCourtLocation?.courtLocation;

  return summaryRow(
    t('PAGES.SPECIFIC_COURT.SELECTED_COURT', {lng}),
    hasSpecificCourtLocation,
    constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL),
    changeLabel(lng),
  );
};
