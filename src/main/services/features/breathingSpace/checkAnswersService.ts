import {Claim} from 'common/models/claim';
import {SummaryRow, summaryRow} from 'common/models/summaryList/summaryList';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {LIFT_BREATHING_SPACE_URL} from 'routes/urls';

export const getSummaryRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const liftBreathing = claim.breathingSpace?.liftBreathing;
  const changeUrl = constructResponseUrlWithIdParams(claimId, LIFT_BREATHING_SPACE_URL);
  const changeLabel = t('COMMON.BUTTONS.CHANGE', {lng: lang});
  const expectedEnd = liftBreathing?.expectedEnd ? formatDateToFullDate(new Date(liftBreathing.expectedEnd), lang) : '';

  return [
    summaryRow(
      t('PAGES.BREATHING_SPACE.LIFT.WHEN_END', {lng: lang}),
      expectedEnd,
      changeUrl,
      changeLabel,
    ),
    summaryRow(
      t('PAGES.BREATHING_SPACE.LIFT.WHY_LIFTED', {lng: lang}),
      liftBreathing?.eventDescription || '',
      changeUrl,
      changeLabel,
    ),
  ];
};
