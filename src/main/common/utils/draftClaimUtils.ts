import {addDaysToDate, formatDateToFullDate} from './dateUtils';
import {getTTLDaysForCategory, TTLCategory} from 'modules/draft-store/ttlConfig';

const getDraftClaimTtlDays = (draftClaimCacheTtlDays: number): number | undefined => {
  const ttlDays = Number(draftClaimCacheTtlDays);
  if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
    return undefined;
  }

  const configuredTtlDays = getTTLDaysForCategory(TTLCategory.DRAFT_CLAIM);
  return Math.min(ttlDays, configuredTtlDays);
};

const getDraftClaimCreatedAt = (draftClaimCreatedAt: Date | string): Date | undefined => {
  const createdAt = new Date(draftClaimCreatedAt);
  if (Number.isNaN(createdAt.getTime())) {
    return undefined;
  }

  return createdAt.getTime() > Date.now() ? new Date() : createdAt;
};

export const getDraftClaimDeletionDate = (
  draftClaimCreatedAt?: Date | string,
  draftClaimCacheTtlDays?: number,
  lang?: string,
): string | undefined => {
  if (!draftClaimCreatedAt || !draftClaimCacheTtlDays) {
    return undefined;
  }

  const ttlDays = getDraftClaimTtlDays(draftClaimCacheTtlDays);
  const createdAt = getDraftClaimCreatedAt(draftClaimCreatedAt);
  if (!ttlDays || !createdAt) {
    return undefined;
  }

  return formatDateToFullDate(
    addDaysToDate(createdAt, ttlDays),
    lang,
  );
};
