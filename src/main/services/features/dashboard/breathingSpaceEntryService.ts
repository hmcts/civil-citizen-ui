import {AppRequest} from 'models/AppRequest';
import {Request} from 'express';
import {
  deleteFieldDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {BreathingSpaceStartDate} from 'models/breathingSpace/breathingSpaceStartDate';
import {Claim} from 'models/claim';
import {addDaysToDate, formatDateToFullDate} from 'common/utils/dateUtils';
import {summaryRow, summaryRowWithTextValue, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {BREATHING_SPACE_ENTER_URL, BREATHING_SPACE_START_DATE_URL} from 'routes/urls';

const STANDARD_BREATHING_SPACE_DAYS = 60;

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
