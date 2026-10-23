import config from 'config';
import {DateTime} from 'luxon';

const DAY_TO_SECONDS = 86400;
const DRAFT_CLAIM_EXPIRY_ZONE = 'Europe/London';
const LEGACY_DRAFT_CLAIM_TTL_DAYS = 180;

export enum TTLCategory {
  DRAFT_CLAIM = 'DRAFT_CLAIM',
  JOURNEY_CACHE = 'JOURNEY_CACHE',
  PAYMENT_SESSION = 'PAYMENT_SESSION',
  GA_JOURNEY = 'GA_JOURNEY',
}

export interface TTLMetadata {
  creationDate?: Date;
  overrideExistingTTL?: boolean;
}

const getNumericConfigValue = (path: string): number => {
  return Number(config.get<number | string>(path));
};

export const getTTLDaysForCategory = (category: TTLCategory): number => {
  switch (category) {
    case TTLCategory.DRAFT_CLAIM:
      return getNumericConfigValue('services.draftStore.redis.ttl.draftClaim');
    case TTLCategory.JOURNEY_CACHE:
      return getNumericConfigValue('services.draftStore.redis.ttl.journeyCache');
    case TTLCategory.PAYMENT_SESSION:
      return getNumericConfigValue('services.draftStore.redis.ttl.paymentSession');
    case TTLCategory.GA_JOURNEY:
      return getNumericConfigValue('services.draftStore.redis.ttl.gaJourney');
  }
};

export const calculateExpiryTimestamp = (
  category: TTLCategory,
  metadata?: TTLMetadata,
): number => {
  const ttlInDays = getTTLDaysForCategory(category);
  const baseDate = metadata?.creationDate ?? new Date();
  if (category === TTLCategory.DRAFT_CLAIM) {
    return Math.floor(
      DateTime.fromJSDate(baseDate)
        .setZone(DRAFT_CLAIM_EXPIRY_ZONE)
        .plus({days: ttlInDays + 1})
        .startOf('day')
        .toSeconds(),
    );
  }

  const ttlInSeconds = ttlInDays * DAY_TO_SECONDS;
  return Math.round(baseDate.getTime() / 1000) + ttlInSeconds;
};

export const reconstructCreationDateFromRemainingTtl = (
  remainingTtlSeconds: number,
  category: TTLCategory,
): Date => {
  const ttlDays = category === TTLCategory.DRAFT_CLAIM
    ? LEGACY_DRAFT_CLAIM_TTL_DAYS
    : getTTLDaysForCategory(category);
  const totalTtlSeconds = ttlDays * DAY_TO_SECONDS;
  const elapsedSeconds = Math.max(0, totalTtlSeconds - remainingTtlSeconds);
  return new Date(Date.now() - elapsedSeconds * 1000);
};
