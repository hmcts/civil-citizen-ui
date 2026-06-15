import config from 'config';

const DAY_TO_SECONDS = 86400;

export enum TTLCategory {
  DRAFT_CLAIM = 'DRAFT_CLAIM',
  JOURNEY_CACHE = 'JOURNEY_CACHE',
  PAYMENT_SESSION = 'PAYMENT_SESSION',
  GA_JOURNEY = 'GA_JOURNEY',
}

export interface TTLMetadata {
  creationDate?: Date;
}

const DRAFT_CLAIM_TTL_PATH = 'services.draftStore.redis.ttl.draftClaim';
const LEGACY_DRAFT_CLAIM_TTL_PATH = 'services.draftStore.redis.expireInDays';

const getDraftClaimTtlDays = (): number => {
  if (config.has(DRAFT_CLAIM_TTL_PATH)) {
    return config.get<number>(DRAFT_CLAIM_TTL_PATH);
  }
  return config.get<number>(LEGACY_DRAFT_CLAIM_TTL_PATH);
};

const getTTLDaysForCategory = (category: TTLCategory): number => {
  switch (category) {
    case TTLCategory.DRAFT_CLAIM:
      return getDraftClaimTtlDays();
    case TTLCategory.JOURNEY_CACHE:
      return config.get<number>('services.draftStore.redis.ttl.journeyCache');
    case TTLCategory.PAYMENT_SESSION:
      return config.get<number>('services.draftStore.redis.ttl.paymentSession');
    case TTLCategory.GA_JOURNEY:
      return config.get<number>('services.draftStore.redis.ttl.gaJourney');
  }
};

export const calculateExpiryTimestamp = (
  category: TTLCategory,
  metadata?: TTLMetadata,
): number => {
  const ttlInDays = getTTLDaysForCategory(category);
  const ttlInSeconds = ttlInDays * DAY_TO_SECONDS;
  const baseDate = metadata?.creationDate ?? new Date();
  return Math.round(baseDate.getTime() / 1000) + ttlInSeconds;
};

export const reconstructCreationDateFromRemainingTtl = (
  remainingTtlSeconds: number,
  category: TTLCategory,
): Date => {
  const totalTtlSeconds = getTTLDaysForCategory(category) * DAY_TO_SECONDS;
  const elapsedSeconds = totalTtlSeconds - remainingTtlSeconds;
  return new Date(Date.now() - elapsedSeconds * 1000);
};
