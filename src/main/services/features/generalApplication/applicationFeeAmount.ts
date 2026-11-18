import {ClaimFeeData} from 'models/civilClaimResponse';

export function applicationFeeInPounds(fee?: ClaimFeeData): string | undefined {
  // CCD drafts may serialise a whole number of pence as a decimal string.
  const raw: unknown = fee?.calculatedAmountInPence;
  if (typeof raw !== 'number' && !(typeof raw === 'string' && /^\d+(?:\.0+)?$/.test(raw))) return undefined;
  const pence = Number(raw);
  if (!Number.isSafeInteger(pence) || pence < 0) return undefined;
  const whole = Math.floor(pence / 100);
  const pennies = pence % 100;
  return pennies ? `${whole}.${String(pennies).padStart(2, '0')}` : String(whole);
}
