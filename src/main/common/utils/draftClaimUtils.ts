import {addDaysToDate, formatDateToFullDate} from './dateUtils';

export const getDraftClaimDeletionDate = (
  draftClaimCreatedAt?: Date | string,
  draftClaimCacheTtlDays?: number,
  lang?: string,
): string | undefined => {
  if (!draftClaimCreatedAt || !draftClaimCacheTtlDays) {
    return undefined;
  }

  return formatDateToFullDate(
    addDaysToDate(new Date(draftClaimCreatedAt), draftClaimCacheTtlDays),
    lang,
  );
};
