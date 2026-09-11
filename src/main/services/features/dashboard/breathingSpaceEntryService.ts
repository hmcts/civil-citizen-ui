import {AppRequest} from 'models/AppRequest';
import {Request} from 'express';
import {
  deleteFieldDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceStartDate} from 'models/breathingSpace/breathingSpaceStartDate';
import {Claim} from 'models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {summaryRow, summaryRowWithTextValue, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {BREATHING_SPACE_ENTER_URL, BREATHING_SPACE_START_DATE_URL} from 'routes/urls';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const typeLabel = (type: BreathingSpaceType | undefined, lang: string): string => {
  if (type === BreathingSpaceType.MENTAL_HEALTH) {
    return t('PAGES.BREATHING_SPACE_ENTRY.TYPE_AND_REFERENCE.TYPE_MENTAL_HEALTH', {lng: getLng(lang)});
  }
  if (type === BreathingSpaceType.STANDARD) {
    return t('PAGES.BREATHING_SPACE_ENTRY.TYPE_AND_REFERENCE.TYPE_STANDARD', {lng: getLng(lang)});
  }
  return '';
};

export const getBreathingSpaceEnterDraftForm = (claim: Claim): BreathingSpaceEnterDraft => {
  if (claim.breathingSpaceEnterDraft) {
    return new BreathingSpaceEnterDraft(
      claim.breathingSpaceEnterDraft.type,
      claim.breathingSpaceEnterDraft.reference,
      claim.breathingSpaceEnterDraft.start,
      claim.breathingSpaceEnterDraft.expectedEnd,
    );
  }
  return new BreathingSpaceEnterDraft();
};

export const getBreathingSpaceStartDateForm = (claim: Claim): BreathingSpaceStartDate => {
  const start = claim.breathingSpaceEnterDraft?.start;
  if (!start) {
    return new BreathingSpaceStartDate();
  }
  const date = new Date(start);
  return new BreathingSpaceStartDate(
    String(date.getDate()),
    String(date.getMonth() + 1),
    String(date.getFullYear()),
  );
};

export const resolveBreathingSpaceStartDate = (form: BreathingSpaceStartDate): Date => {
  if (form.date) {
    return form.date;
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const getBreathingSpaceCheckAnswersRows = (claimId: string, claim: Claim, lang?: string): SummaryRow[] => {
  const draft = claim.breathingSpaceEnterDraft;
  const lng = getLng(lang);
  const enterUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_ENTER_URL);
  const startDateUrl = constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_START_DATE_URL);
  const reference = draft?.reference?.trim() ? draft.reference : '';
  const startDateValue = draft?.start ? formatDateToFullDate(new Date(draft.start), lng) : '';

  return [
    summaryRow(
      t('PAGES.BREATHING_SPACE_ENTRY.CYA.TYPE', {lng}),
      typeLabel(draft?.type, lng),
      enterUrl,
      changeLabel(lng),
    ),
    summaryRowWithTextValue(
      t('PAGES.BREATHING_SPACE_ENTRY.CYA.REFERENCE', {lng}),
      reference,
      enterUrl,
      changeLabel(lng),
    ),
    summaryRow(
      t('PAGES.BREATHING_SPACE_ENTRY.CYA.START_DATE', {lng}),
      startDateValue,
      startDateUrl,
      changeLabel(lng),
    ),
  ];
};

export const saveBreathingSpaceEnterDraft = async (
  req: Request,
  form: BreathingSpaceEnterDraft,
): Promise<void> => {
  const redisKey = generateRedisKey(<AppRequest>req);
  const claim = await getCaseDataFromStore(redisKey);
  const existing = claim.breathingSpaceEnterDraft;
  claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
    form.type,
    form.reference,
    existing?.start,
    existing?.expectedEnd,
  );
  await saveDraftClaim(redisKey, claim);
};

export const saveBreathingSpaceStartDate = async (
  req: Request,
  start: Date,
): Promise<void> => {
  const redisKey = generateRedisKey(<AppRequest>req);
  const claim = await getCaseDataFromStore(redisKey);
  if (!claim.breathingSpaceEnterDraft) {
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft();
  }
  claim.breathingSpaceEnterDraft.start = start;
  await saveDraftClaim(redisKey, claim);
};

export const cancelBreathingSpaceEntry = async (req: Request): Promise<void> => {
  const redisKey = generateRedisKey(<AppRequest>req);
  const claim = await getCaseDataFromStore(redisKey);
  await deleteFieldDraftClaimFromStore(redisKey, claim, 'breathingSpaceEnterDraft');
};

const isSameCalendarDay = (date: Date, compareTo: Date): boolean => {
  return date.getFullYear() === compareTo.getFullYear()
    && date.getMonth() === compareTo.getMonth()
    && date.getDate() === compareTo.getDate();
};

export const getBreathingSpaceConfirmationPanelTitle = (type?: string): string => {
  if (type === BreathingSpaceType.MENTAL_HEALTH) {
    return 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_APPLIED';
  }
  return 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_APPLIED';
};

export const getBreathingSpaceConfirmationNextContent = (
  type?: string,
  start?: Date | string,
  lang?: string,
): {key: string; variables?: {startDate: string}} => {
  const startDate = start ? new Date(start) : undefined;
  const isMentalHealth = type === BreathingSpaceType.MENTAL_HEALTH;

  if (!startDate || Number.isNaN(startDate.getTime()) || isSameCalendarDay(startDate, new Date())) {
    return {
      key: isMentalHealth
        ? 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_NEXT_NOW'
        : 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_NEXT_NOW',
    };
  }

  return {
    key: isMentalHealth
      ? 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_NEXT_FROM'
      : 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_NEXT_FROM',
    variables: {startDate: formatDateToFullDate(startDate, lang)},
  };
};
