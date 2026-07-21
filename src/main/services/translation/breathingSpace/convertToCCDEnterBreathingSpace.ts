import {Claim} from 'models/claim';
import {CCDEnterBreathingSpace} from 'models/ccdResponse/ccdEnterBreathingSpace';
import {convertDateToStringFormat} from 'common/utils/dateUtils';

export const translateDraftBreathingSpaceEnterToCCD = (claim: Claim): CCDEnterBreathingSpace => {
  const draft = claim.breathingSpaceEnterDraft;
  const reference = draft?.reference?.trim();

  return {
    enterBreathing: {
      type: draft?.type,
      ...(reference ? {reference} : {}),
      ...(draft?.start ? {start: convertDateToStringFormat(draft.start)} : {}),
      expectedEnd: draft?.expectedEnd
        ? convertDateToStringFormat(draft.expectedEnd)
        : null,
    },
  };
};
